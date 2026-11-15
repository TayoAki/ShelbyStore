"use client"

import { X } from "@phosphor-icons/react"
import { useRef } from "react"

export type SizeChart = { unit?: string; columns: string[]; rows: Record<string, string | number>[] }

/** Size guide dialog, opened from the size row (10/11 studied sites). */
export function SizeGuide({ fitNotes, modelInfo, chart }: { fitNotes: string | null; modelInfo: string | null; chart: SizeChart | null }) {
  const dialog = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="text-[13px] underline underline-offset-4 hover:text-ink-muted">
        Size guide
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[2px] bg-page p-0 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-ink/40"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close()
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-[22px]">Size guide</h2>
          <button type="button" aria-label="Close" onClick={() => dialog.current?.close()} className="-mr-2 p-2">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5 text-[15px]">
          {fitNotes && (
            <div className="flex flex-col gap-1">
              <p className="text-eyebrow text-ink-muted">Fit</p>
              <p>{fitNotes}</p>
            </div>
          )}
          {modelInfo && (
            <div className="flex flex-col gap-1">
              <p className="text-eyebrow text-ink-muted">On the model</p>
              <p>{modelInfo}</p>
            </div>
          )}
          {chart && chart.rows.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-eyebrow text-ink-muted">Measurements{chart.unit ? ` (${chart.unit})` : ""}</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[13px]">
                  <thead>
                    <tr>
                      {chart.columns.map((c) => (
                        <th key={c} scope="col" className="border-b border-line py-2 pr-3 text-left font-medium text-ink-muted">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, i) => (
                      <tr key={i} className="border-b border-line">
                        {chart.columns.map((c) => (
                          <td key={c} className="py-2 pr-3">
                            {row[c]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!fitNotes && !modelInfo && !chart && <p className="text-ink-muted">Size details are coming soon.</p>}
        </div>
      </dialog>
    </>
  )
}
