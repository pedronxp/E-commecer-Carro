import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-foreground",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
export type { SelectProps }
