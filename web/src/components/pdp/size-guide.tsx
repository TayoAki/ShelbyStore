"use client"

import { X } from "@phosphor-icons/react"
import { useRef } from "react"

export type SizeChart = { unit?: string; columns: string[]; rows: Record<string, string | number>[] }

/** Melin's size dialog (SITE_SPEC §6.4.17), opened by a "Size Guide" micro link. */
export function SizeGuide({ fitNotes, chart, label = "Size Guide" }: { fitNotes: string | null; chart: SizeChart | null; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="btn btn--micro">
        <span>{label}</span>
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-addon bg-white p-6 text-black backdrop:bg-black/80"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-[18px]">Size Guide</h2>
          <button type="button" aria-label="Close" onClick={() => dialog.current?.close()}>
            <X size={20} />
          </button>
        </div>
        {chart && chart.rows.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {chart.columns.map((c) => (
                  <th key={c} scope="col" className="border-b border-line py-[10px] pr-3 text-left font-heading text-[12px] uppercase tracking-[1.3px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row, i) => (
                <tr key={i}>
                  {chart.columns.map((c) => (
                    <td key={c} className="border-b border-line py-[10px] pr-3 font-body text-[14px]">
                      {row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {fitNotes && <p className="mt-4 font-body text-[13px] leading-[19.5px]">{fitNotes}</p>}
        {!chart && !fitNotes && <p className="font-body text-[13px]">Size details are coming soon.</p>}
      </dialog>
    </>
  )
}
