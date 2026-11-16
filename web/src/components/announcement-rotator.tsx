"use client"

import { useEffect, useState, type ReactNode } from "react"

/** Crossfades the messages every 5s; pauses on hover or focus; static with one message. */
export function AnnouncementRotator({ messages }: { messages: ReactNode[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (messages.length < 2 || paused) return
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 5000)
    return () => clearInterval(id)
  }, [messages.length, paused])
  return (
    <div
      aria-live="off"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative grid h-9 place-items-center px-4 py-2 font-system text-[14.08px] leading-[20px]"
    >
      {messages.map((m, n) => (
        <div
          key={n}
          aria-hidden={n !== i}
          className={`col-start-1 row-start-1 text-center transition-opacity duration-[400ms] ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {m}
        </div>
      ))}
    </div>
  )
}
