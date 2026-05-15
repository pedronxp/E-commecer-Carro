import Image from "next/image"
import type { ReactNode } from "react"

interface ImagePageHeroProps {
  eyebrow: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  children?: ReactNode
}

export default function ImagePageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  children,
}: ImagePageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.92)_0%,_rgba(2,6,23,0.78)_34%,_rgba(2,6,23,0.36)_68%,_rgba(2,6,23,0.18)_100%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}
