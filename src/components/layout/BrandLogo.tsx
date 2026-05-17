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
    <span
      className={cn(
        "inline-flex items-center gap-3",
        isLight ? "text-white" : "text-slate-950",
        className,
      )}
      aria-label="Lima Automóveis"
    >
      <span className="brand-logo-monogram" aria-hidden="true">
        <span className="brand-logo-l">L</span>
        <span className="brand-logo-line" />
      </span>
      <span className="leading-none">
        <span className="block text-[1.05rem] font-black uppercase tracking-[0.14em] sm:text-[1.18rem]">
          Lima
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.24em]",
              isLight ? "text-white/72" : "text-slate-500",
            )}
          >
            Automóveis
          </span>
        )}
      </span>
    </span>
  )
}
