import Link from "next/link"

/** The text wordmark `shelby` where Melin's logo sits (SITE_SPEC §1.2, §6.0.2). */
export function Wordmark({ className = "", size = "desktop" }: { className?: string; size?: "desktop" | "mobile" }) {
  return (
    <Link
      href="/"
      aria-label="Shelby home"
      className={`font-heading lowercase leading-none text-black ${size === "desktop" ? "text-[27px] tracking-[-0.5px]" : "text-[24px] tracking-[-0.5px]"} ${className}`}
    >
      shelby
    </Link>
  )
}
