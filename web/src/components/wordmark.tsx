import Link from "next/link"

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Shelby home" className={`font-display text-[22px] leading-none tracking-[0.02em] lg:text-[26px] ${className}`}>
      Shelby
    </Link>
  )
}
