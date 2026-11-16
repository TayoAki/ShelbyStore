"use client"

import { colorway } from "@/lib/swatches"
import { useSelection } from "../pdp/selection"

const S = 11 // drawing units per centimetre
const B = 150 // the shared baseline: the sweatband line

/** A five-panel rope cap in side profile, facing right, its crown `h` cm tall. */
function crownPath(h: number) {
  const H = h * S
  return [
    `M 52 ${B}`,
    `C 46 ${B - 0.55 * H} 78 ${B - H} 128 ${B - H}`,
    `C 176 ${B - H} 210 ${B - 0.78 * H} 214 ${B - 0.3 * H}`,
    `C 215 ${B - 0.12 * H} 214 ${B - 4} 213 ${B}`,
    "Z",
  ].join(" ")
}

/**
 * The side panel's drawing: two authored cap profiles on one ruler baseline,
 * drawn to the same scale. A high-crown rope cap (12 cm, dashed) behind; the
 * Rope Cap in front, printed in the ink of the cap chosen on the front panel.
 */
export function CrownProfiles({ low, top, fallbackColor }: { low: number; top: number; fallbackColor: string }) {
  const { color } = useSelection()
  const w = colorway(color ?? fallbackColor)
  const H = top * S
  const label = low === top ? `${top} cm` : `${low}–${top} cm`
  return (
    <svg
      role="img"
      aria-label={`Side profiles drawn to scale: the Rope Cap's crown, ${label}, in front of a 12 cm high crown`}
      viewBox="0 0 320 172"
      className="block h-auto w-full max-w-[460px] overflow-visible text-ink"
    >
      {/* ruler */}
      <line x1="22" x2="22" y1={B} y2={B - 13 * S} stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          <line x1="22" x2={i % 2 === 0 ? 31 : 27} y1={B - i * S} y2={B - i * S} stroke="currentColor" strokeWidth="1.2" />
          {i % 2 === 0 && i <= 12 && (
            <text x="16" y={B - i * S + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="var(--font-label)">
              {i}
            </text>
          )}
        </g>
      ))}
      <line x1="22" x2="314" y1={B} y2={B} stroke="currentColor" strokeWidth="1.5" />

      {/* the high crown, 12 cm, outlined behind */}
      <path d={crownPath(12)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 3" />
      <line x1="31" x2="314" y1={B - 12 * S} y2={B - 12 * S} stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2.5" />
      <text x="316" y={B - 12 * S - 6} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.6" fill="currentColor" fontFamily="var(--font-label)">
        HIGH CROWN 12 CM
      </text>

      {/* the Rope Cap, in the chosen ink */}
      <g style={{ transition: "fill var(--beat) var(--ease-box)" }}>
        <path d={crownPath(top)} fill={w.crown} stroke="currentColor" strokeWidth="1.6" style={{ transition: "fill .42s var(--ease-box)" }} />
        <path d={`M 128 ${B - H} C 150 ${B - 0.6 * H} 160 ${B - 0.3 * H} 162 ${B}`} fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <path d={`M 54 ${B - 16} L 76 ${B - 11}`} stroke="currentColor" strokeWidth="1.6" />
        <path
          d={`M 206 ${B - 3} C 236 ${B - 6} 276 ${B - 1} 306 ${B + 12} C 296 ${B + 16} 262 ${B + 8} 210 ${B + 5} Z`}
          fill={w.crown}
          stroke="currentColor"
          strokeWidth="1.6"
          style={{ transition: "fill .42s var(--ease-box)" }}
        />
        <path d={`M 214 ${B - 13} C 200 ${B - 10} 184 ${B - 6} 168 ${B - 1}`} fill="none" stroke={w.rope} strokeWidth="4.5" strokeLinecap="round" style={{ transition: "stroke .42s var(--ease-box)" }} />
        <path d={`M 214 ${B - 13} C 200 ${B - 10} 184 ${B - 6} 168 ${B - 1}`} fill="none" stroke="#00000033" strokeWidth="4.5" strokeDasharray="2 3" />
        <circle cx="128" cy={B - H - 1.5} r="3" fill="currentColor" />
      </g>
      <line x1="31" x2="314" y1={B - H} y2={B - H} stroke="currentColor" strokeWidth="0.8" />
      <text x="316" y={B - H + 16} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.6" fill="currentColor" fontFamily="var(--font-label)">
        ROPE CAP {String(top).toUpperCase()} CM
      </text>
    </svg>
  )
}
