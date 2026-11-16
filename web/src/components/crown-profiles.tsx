"use client"

import { colorway } from "@/lib/swatches"
import { useSelection } from "./pdp/selection"

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
 * Crown profiles (SITE_SPEC v8 E.5.12): two cap profiles on one ruler
 * baseline, drawn to the same scale on #F6F6F6. A 12 cm high crown as a dashed
 * #646464 outline behind; the Rope Cap in front, filled in the chosen colour
 * with its rope. Lines #212121 at 1.5px, ruler labels 11px #646464.
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
      className="block h-auto w-full max-w-[460px] overflow-visible bg-tile p-4 text-text"
    >
      {/* ruler */}
      <line x1="22" x2="22" y1={B} y2={B - 13 * S} stroke="#646464" strokeWidth="1.5" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          <line x1="22" x2={i % 2 === 0 ? 31 : 27} y1={B - i * S} y2={B - i * S} stroke="#646464" strokeWidth="1.5" />
          {i % 2 === 0 && i <= 12 && (
            <text x="16" y={B - i * S + 4} textAnchor="end" fontSize="11" fontWeight="500" fill="#646464" fontFamily="var(--font-body)">
              {i}
            </text>
          )}
        </g>
      ))}
      <line x1="22" x2="314" y1={B} y2={B} stroke="currentColor" strokeWidth="1.5" />

      {/* the high crown, 12 cm, outlined behind */}
      <path d={crownPath(12)} fill="none" stroke="#646464" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="31" x2="314" y1={B - 12 * S} y2={B - 12 * S} stroke="#646464" strokeWidth="1" strokeDasharray="2 2.5" />
      <text x="316" y={B - 12 * S - 6} textAnchor="end" fontSize="11" fontWeight="500" letterSpacing="0.6" fill="#646464" fontFamily="var(--font-body)">
        HIGH CROWN 12 CM
      </text>

      {/* the Rope Cap, in the chosen ink */}
      <g>
        <path d={crownPath(top)} fill={w.crown} stroke="currentColor" strokeWidth="1.5" style={{ transition: "fill .3s ease-out" }} />
        <path d={`M 128 ${B - H} C 150 ${B - 0.6 * H} 160 ${B - 0.3 * H} 162 ${B}`} fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
        <path d={`M 54 ${B - 16} L 76 ${B - 11}`} stroke="currentColor" strokeWidth="1.5" />
        <path
          d={`M 206 ${B - 3} C 236 ${B - 6} 276 ${B - 1} 306 ${B + 12} C 296 ${B + 16} 262 ${B + 8} 210 ${B + 5} Z`}
          fill={w.crown}
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ transition: "fill .3s ease-out" }}
        />
        <path d={`M 214 ${B - 13} C 200 ${B - 10} 184 ${B - 6} 168 ${B - 1}`} fill="none" stroke={w.rope} strokeWidth="3" strokeLinecap="round" style={{ transition: "stroke .3s ease-out" }} />
        <path d={`M 214 ${B - 13} C 200 ${B - 10} 184 ${B - 6} 168 ${B - 1}`} fill="none" stroke="#00000033" strokeWidth="3" strokeDasharray="2 3" />
        <circle cx="128" cy={B - H - 1.5} r="3" fill="currentColor" />
      </g>
      <line x1="31" x2="314" y1={B - H} y2={B - H} stroke="currentColor" strokeWidth="1" />
      <text x="316" y={B - H + 16} textAnchor="end" fontSize="11" fontWeight="500" letterSpacing="0.6" fill="currentColor" fontFamily="var(--font-body)">
        ROPE CAP {String(top).toUpperCase()} CM
      </text>
    </svg>
  )
}
