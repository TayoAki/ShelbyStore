/**
 * SQL builders for first-party analytics. Every builder returns SQL text that
 * only contains constants and `?` placeholders; all user-supplied values
 * (event names, property keys, filter values, dates) travel as bindings.
 * Column names come from a fixed whitelist.
 */

export type SqlQuery = { sql: string; params: unknown[] }

/** Event columns that can be filtered or broken down on directly. */
export const EVENT_COLUMNS = [
  "event",
  "distinct_id",
  "session_id",
  "path",
  "url",
  "referrer",
  "asset",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "device_type",
  "platform",
] as const
export type EventColumn = (typeof EVENT_COLUMNS)[number]

export const PROPERTY_KEY_PATTERN = /^[$a-zA-Z0-9_.:-]{1,64}$/
export const EVENT_NAME_PATTERN = /^[$a-z0-9_]{1,64}$/

export type PropertyFilter = {
  key: string
  op: "eq" | "neq" | "is_set" | "is_not_set" | "contains"
  value?: string
}

export type FunnelStep = { event: string; filters?: PropertyFilter[]; label?: string }

/** Views that don't count as interaction when deciding whether a session bounced. */
export const PASSIVE_EVENTS = [
  "$pageview",
  "$screen",
  "$pageleave",
  "$experiment_exposure",
  "product_viewed",
  "drop_viewed",
] as const
const VIEW_EVENTS_SQL = "('$pageview', '$screen')"

/** Small composer that keeps SQL text and bindings in the same order. */
class Builder {
  private parts: string[] = []
  readonly params: unknown[] = []
  add(sql: string, ...params: unknown[]) {
    const holes = (sql.match(/\?/g) ?? []).length
    if (holes !== params.length) {
      throw new Error(`SQL fragment has ${holes} placeholders but ${params.length} params`)
    }
    this.parts.push(sql)
    this.params.push(...params)
    return this
  }
  addFragment(f: SqlQuery) {
    this.parts.push(f.sql)
    this.params.push(...f.params)
    return this
  }
  build(): SqlQuery {
    return { sql: this.parts.join(" "), params: [...this.params] }
  }
}

const isColumn = (key: string): key is EventColumn => (EVENT_COLUMNS as readonly string[]).includes(key)

/** `e.asset` for a column, `(e.properties ->> ?)` for anything else. */
export function fieldExpr(key: string, alias = "e"): SqlQuery {
  if (isColumn(key)) {
    return { sql: `${alias}.${key}`, params: [] }
  }
  if (!PROPERTY_KEY_PATTERN.test(key)) {
    throw new Error(`Invalid property key: ${key}`)
  }
  return { sql: `(${alias}.properties ->> ?)`, params: [key] }
}

/** Escapes LIKE wildcards in a user value. */
const likeEscape = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`)

export function filterSql(filters: PropertyFilter[] | undefined, alias = "e"): SqlQuery {
  const b = new Builder()
  for (const f of filters ?? []) {
    const field = fieldExpr(f.key, alias)
    switch (f.op) {
      case "eq":
        b.add("AND").addFragment(field).add("= ?", f.value ?? "")
        break
      case "neq":
        b.add("AND (").addFragment(field).add("IS DISTINCT FROM ?)", f.value ?? "")
        break
      case "is_set":
        b.add("AND").addFragment(field).add("IS NOT NULL AND").addFragment(field).add("<> ''")
        break
      case "is_not_set":
        b.add("AND (").addFragment(field).add("IS NULL OR").addFragment(field).add("= '')")
        break
      case "contains":
        b.add("AND").addFragment(field).add("ILIKE ?", `%${likeEscape(f.value ?? "")}%`)
        break
    }
  }
  return b.build()
}

/**
 * Ordered funnel, counted per person (distinct_id), PostHog-style:
 *
 * - Step 1: each person's FIRST matching event in [from, to).
 * - Step k: the first matching event at or after step k-1, and no later than
 *   step 1 + window. Strict order, conversions may land after `to`.
 * - Breakdown: the property value on the person's step-1 event.
 *
 * Built as a chain of CTEs (s1 … sN) so Postgres does the work; the result is
 * one row per breakdown value with per-step counts and median seconds from
 * step 1 to each later step.
 */
export function funnelQuery(input: {
  steps: FunnelStep[]
  from: Date
  to: Date
  windowSeconds: number
  breakdown?: string | null
}): SqlQuery {
  const { steps } = input
  if (steps.length < 2) throw new Error("A funnel needs at least two steps")
  const b = new Builder()
  b.add("WITH s1 AS (SELECT DISTINCT ON (e.distinct_id) e.distinct_id, e.occurred_at AS t1,")
  if (input.breakdown) {
    b.addFragment(fieldExpr(input.breakdown, "e"))
  } else {
    b.add("NULL::text")
  }
  b.add("AS bd FROM analytics_event e WHERE e.deleted_at IS NULL AND e.event = ? AND e.occurred_at >= ? AND e.occurred_at < ?", steps[0].event, input.from, input.to)
  b.addFragment(filterSql(steps[0].filters, "e"))
  b.add("ORDER BY e.distinct_id, e.occurred_at)")

  for (let k = 2; k <= steps.length; k++) {
    const prev = k - 1
    b.add(`, s${k} AS (SELECT p.distinct_id, p.t1, MIN(e.occurred_at) AS t${k} FROM s${prev} p JOIN analytics_event e ON e.distinct_id = p.distinct_id`)
    b.add(
      `WHERE e.deleted_at IS NULL AND e.event = ? AND e.occurred_at >= p.t${prev} AND e.occurred_at <= p.t1 + (? * interval '1 second')`,
      steps[k - 1].event,
      input.windowSeconds
    )
    b.addFragment(filterSql(steps[k - 1].filters, "e"))
    b.add("GROUP BY p.distinct_id, p.t1)")
  }

  const counts = steps.map((_, i) => (i === 0 ? "COUNT(*)::int AS step_1" : `COUNT(s${i + 1}.distinct_id)::int AS step_${i + 1}`))
  const medians = steps
    .slice(1)
    .map(
      (_, i) =>
        `percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (s${i + 2}.t${i + 2} - s1.t1))) AS median_${i + 2}`
    )
  b.add(`SELECT s1.bd AS breakdown, ${[...counts, ...medians].join(", ")} FROM s1`)
  for (let k = 2; k <= steps.length; k++) {
    b.add(`LEFT JOIN s${k} ON s${k}.distinct_id = s1.distinct_id`)
  }
  b.add("GROUP BY s1.bd ORDER BY step_1 DESC")
  return b.build()
}

/** Daily counts and unique people per event (days in `timezone`), optional breakdown. */
export function trendsQuery(input: {
  events: string[]
  from: Date
  to: Date
  timezone: string
  breakdown?: string | null
  filters?: PropertyFilter[]
}): SqlQuery {
  if (!input.events.length) throw new Error("Pick at least one event")
  const b = new Builder()
  b.add("SELECT to_char(date_trunc('day', e.occurred_at AT TIME ZONE ?), 'YYYY-MM-DD') AS day, e.event AS event,", input.timezone)
  if (input.breakdown) b.addFragment(fieldExpr(input.breakdown, "e"))
  else b.add("NULL::text")
  b.add("AS breakdown, COUNT(*)::int AS count, COUNT(DISTINCT e.distinct_id)::int AS users")
  b.add(
    `FROM analytics_event e WHERE e.deleted_at IS NULL AND e.event IN (${input.events.map(() => "?").join(", ")}) AND e.occurred_at >= ? AND e.occurred_at < ?`,
    ...input.events,
    input.from,
    input.to
  )
  b.addFragment(filterSql(input.filters, "e"))
  b.add("GROUP BY 1, 2, 3 ORDER BY 1, 2")
  return b.build()
}

const range = (from: Date, to: Date): SqlQuery => ({
  sql: "e.deleted_at IS NULL AND e.occurred_at >= ? AND e.occurred_at < ?",
  params: [from, to],
})

/** The overview page's queries (all over the same range). */
export function overviewQueries(from: Date, to: Date, timezone: string) {
  const r = range(from, to)
  const passive = PASSIVE_EVENTS.map((e) => `'${e.replace(/'/g, "")}'`).join(", ")
  const safeNum = (key: string) =>
    `CASE WHEN (e.properties ->> '${key}') ~ '^[0-9]+(\\.[0-9]+){0,1}$' THEN (e.properties ->> '${key}')::numeric END`

  const totals: SqlQuery = {
    sql: `SELECT
      COUNT(*) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS pageviews,
      COUNT(DISTINCT e.distinct_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS visitors,
      COUNT(DISTINCT e.session_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS sessions,
      COUNT(*) FILTER (WHERE e.event = 'order_completed')::int AS orders,
      COALESCE(SUM(${safeNum("value")}) FILTER (WHERE e.event = 'order_completed'), 0)::float AS revenue
      FROM analytics_event e WHERE ${r.sql}`,
    params: r.params,
  }

  const bounce: SqlQuery = {
    sql: `WITH s AS (
        SELECT e.session_id,
          COUNT(*) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL}) AS views,
          COUNT(*) FILTER (WHERE e.event NOT IN (${passive})) AS interactions
        FROM analytics_event e WHERE ${r.sql} AND e.session_id IS NOT NULL
        GROUP BY e.session_id)
      SELECT COUNT(*)::int AS sessions, COUNT(*) FILTER (WHERE views = 1 AND interactions = 0)::int AS bounced
      FROM s WHERE views > 0`,
    params: r.params,
  }

  const daily: SqlQuery = {
    sql: `SELECT to_char(date_trunc('day', e.occurred_at AT TIME ZONE ?), 'YYYY-MM-DD') AS day,
        COUNT(*) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS pageviews,
        COUNT(DISTINCT e.distinct_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS visitors,
        COUNT(*) FILTER (WHERE e.event = 'order_completed')::int AS orders
      FROM analytics_event e WHERE ${r.sql} GROUP BY 1 ORDER BY 1`,
    params: [timezone, ...r.params],
  }

  const paths: SqlQuery = {
    sql: `WITH pv AS (
        SELECT e.path, COUNT(*)::int AS views, COUNT(DISTINCT e.distinct_id)::int AS visitors
        FROM analytics_event e WHERE ${r.sql} AND e.event IN ${VIEW_EVENTS_SQL} AND e.path IS NOT NULL
        GROUP BY e.path),
      pl AS (
        SELECT e.path, AVG(${safeNum("time_on_page_ms")})::float AS avg_time_ms, AVG(${safeNum("max_scroll_pct")})::float AS avg_scroll_pct
        FROM analytics_event e WHERE ${r.sql} AND e.event = '$pageleave' AND e.path IS NOT NULL
        GROUP BY e.path)
      SELECT pv.path, pv.views, pv.visitors, pl.avg_time_ms, pl.avg_scroll_pct
      FROM pv LEFT JOIN pl ON pl.path = pv.path ORDER BY pv.views DESC LIMIT 20`,
    params: [...r.params, ...r.params],
  }

  const assets: SqlQuery = {
    sql: `SELECT e.asset,
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS sessions,
        COUNT(DISTINCT e.distinct_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL})::int AS visitors,
        COUNT(*) FILTER (WHERE e.event = 'order_completed')::int AS orders,
        COALESCE(SUM(${safeNum("value")}) FILTER (WHERE e.event = 'order_completed'), 0)::float AS revenue
      FROM analytics_event e WHERE ${r.sql} AND e.asset IS NOT NULL AND e.asset <> ''
      GROUP BY e.asset ORDER BY sessions DESC, orders DESC LIMIT 20`,
    params: r.params,
  }

  const referrers: SqlQuery = {
    sql: `SELECT substring(e.referrer from '^https{0,1}://([^/#\\x3F]+)') AS host, COUNT(DISTINCT e.session_id)::int AS sessions
      FROM analytics_event e WHERE ${r.sql} AND e.event = '$pageview' AND e.referrer ~ '^https{0,1}://'
        AND substring(e.referrer from '^https{0,1}://([^/#\\x3F]+)') IS DISTINCT FROM substring(e.url from '^https{0,1}://([^/#\\x3F]+)')
      GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    params: r.params,
  }

  const devices: SqlQuery = {
    sql: `SELECT COALESCE(e.device_type, 'unknown') AS device_type, COUNT(DISTINCT e.session_id)::int AS sessions
      FROM analytics_event e WHERE ${r.sql} AND e.event IN ${VIEW_EVENTS_SQL} GROUP BY 1 ORDER BY 2 DESC`,
    params: r.params,
  }

  return { totals, bounce, daily, paths, assets, referrers, devices }
}

/** Regex matching `asset=<key>` as a whole query parameter in a URL. */
export const assetUrlPattern = (asset: string) =>
  `[?&]asset=${asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(&|#|$)`

/**
 * Tagged sessions for one asset (the scorecards' "channel response"):
 * - landing: sessions with a page/screen view whose URL carried ?asset=<key>
 * - product views: sessions with `product_viewed` attributed to the asset
 */
export function assetSessionsQuery(asset: string, from: Date, to: Date): SqlQuery {
  const pattern = assetUrlPattern(asset)
  return {
    sql: `SELECT
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event IN ${VIEW_EVENTS_SQL} AND e.url ~ ?)::int AS landing_sessions,
        COUNT(DISTINCT e.session_id) FILTER (WHERE e.event = 'product_viewed' AND e.asset = ?)::int AS product_view_sessions
      FROM analytics_event e
      WHERE e.deleted_at IS NULL AND e.occurred_at >= ? AND e.occurred_at < ? AND (e.asset = ? OR e.url ~ ?)`,
    params: [pattern, asset, from, to, asset, pattern],
  }
}

/** Event names seen recently, most frequent first (for the funnel builder). */
export function eventNamesQuery(since: Date): SqlQuery {
  return {
    sql: `SELECT e.event, COUNT(*)::int AS count FROM analytics_event e
      WHERE e.deleted_at IS NULL AND e.occurred_at >= ? GROUP BY e.event ORDER BY count DESC LIMIT 100`,
    params: [since],
  }
}

/** Property keys seen on recent events (breakdown options, e.g. $exp_* variants). */
export function propertyKeysQuery(since: Date): SqlQuery {
  return {
    sql: `SELECT DISTINCT jsonb_object_keys(t.properties) AS key FROM (
        SELECT e.properties FROM analytics_event e
        WHERE e.deleted_at IS NULL AND e.occurred_at >= ? AND jsonb_typeof(e.properties) = 'object'
        ORDER BY e.occurred_at DESC LIMIT 5000) t ORDER BY 1 LIMIT 200`,
    params: [since],
  }
}

const INSERT_COLUMNS = [
  "id",
  "event",
  "distinct_id",
  "session_id",
  "occurred_at",
  "received_at",
  "path",
  "url",
  "referrer",
  "asset",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "device_type",
  "platform",
  "properties",
] as const

/**
 * Multi-row insert that skips duplicate `$insert_id`s (unique index, see the
 * analytics module migrations). Returns the ids actually inserted.
 */
export function insertEventsQuery(rows: (Record<(typeof INSERT_COLUMNS)[number], unknown>)[]): SqlQuery {
  const params: unknown[] = []
  const tuples = rows.map((row) => {
    const holes = INSERT_COLUMNS.map((c) => {
      if (c === "properties") {
        params.push(row.properties === null || row.properties === undefined ? null : JSON.stringify(row.properties))
        return "?::jsonb"
      }
      params.push(row[c] ?? null)
      return "?"
    })
    return `(${holes.join(", ")})`
  })
  return {
    sql: `INSERT INTO analytics_event (${INSERT_COLUMNS.join(", ")}) VALUES ${tuples.join(", ")} ON CONFLICT DO NOTHING RETURNING id`,
    params,
  }
}
