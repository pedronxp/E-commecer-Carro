import { cn } from "@/lib/utils"

interface BrandLogoProps {
  tone?: "light" | "dark"
  compact?: boolean
  className?: string
}

export default function BrandLogo({
  tone = "dark",
  compact = false,
  className,
}: BrandLogoProps) {
  const isLight = tone === "light"

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "brand-logo-mark",
          isLight ? "brand-logo-mark-light" : "brand-logo-mark-dark"
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" role="img" focusable="false">
          <path
            d="M12.4 25.4c1.1-5.2 4.4-8.8 9.7-10.7 5.4 1.8 8.8 5.4 10.1 10.7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M9.5 26.1h25.1c1.4 0 2.7 1 3 2.4l.7 3.4H5.8l.7-3.4c.3-1.4 1.6-2.4 3-2.4Z"
            fill="currentColor"
            opacity=".18"
          />
          <path
            d="M13.5 31.9h17.8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <circle cx="13.8" cy="32.4" r="2.4" fill="currentColor" />
          <circle cx="30.2" cy="32.4" r="2.4" fill="currentColor" />
          <path
            d="M18 20.7h8.4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>
      </span>
      <span className={cn("brand-wordmark", isLight && "brand-wordmark-light")}>
        <span className="brand-wordmark-main">Lima</span>
        {!compact && <span className="brand-wordmark-sub">Automóveis</span>}
      </span>
    </span>
  )
}
