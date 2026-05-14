"use client"

import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="number"
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
