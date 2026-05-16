"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Images } from "lucide-react"
import type { CarImage } from "@/types"
import { cn } from "@/lib/utils"

interface CarMediaViewerProps {
  title: string
  images: CarImage[]
}

export default function CarMediaViewer({ title, images }: CarMediaViewerProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const currentImage = images[selectedImage] ?? images[0]

  function goToPrevious() {
    if (images.length <= 1) return
    setSelectedImage((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  function goToNext() {
    if (images.length <= 1) return
    setSelectedImage((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  return (
    <section className="bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white">
          <Images className="h-4 w-4" />
          Fotos
        </div>
        <p className="text-sm font-medium text-white/70">{title}</p>
      </div>

      <PhotoGallery
        title={title}
        images={images}
        currentImage={currentImage}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </section>
  )
}

function PhotoGallery({
  title,
  images,
  currentImage,
  selectedImage,
  onSelectImage,
  onPrevious,
  onNext,
}: {
  title: string
  images: CarImage[]
  currentImage?: CarImage
  selectedImage: number
  onSelectImage: (index: number) => void
  onPrevious: () => void
  onNext: () => void
}) {
  const hasMultipleImages = images.length > 1

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_180px]">
      <div className="relative aspect-[16/10] min-h-[280px] bg-slate-900 sm:aspect-[16/9] lg:min-h-[520px]">
        {currentImage ? (
          <>
            <Image
              src={currentImage.url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 820px, 100vw"
              className="scale-105 object-cover opacity-25 blur-xl"
              aria-hidden="true"
            />
            <Image
              src={currentImage.url}
              alt={currentImage.alt ?? title}
              fill
              priority
              sizes="(min-width: 1024px) 820px, 100vw"
              className="object-contain"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">Sem foto</div>
        )}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={onPrevious}
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-sm backdrop-blur transition hover:bg-slate-950"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-sm backdrop-blur transition hover:bg-slate-950"
              aria-label="Proxima foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {selectedImage + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="grid auto-cols-[7rem] grid-flow-col gap-3 overflow-x-auto border-t border-white/10 px-4 py-4 sm:auto-cols-[8.5rem] sm:px-5 lg:max-h-[520px] lg:auto-cols-auto lg:auto-rows-min lg:grid-flow-row lg:grid-cols-1 lg:content-start lg:overflow-y-auto lg:border-l lg:border-t-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelectImage(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-slate-800 transition",
                selectedImage === index
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-75 hover:border-white/40 hover:opacity-100"
              )}
              aria-label={`Ver foto ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${title} foto ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 180px, 136px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
