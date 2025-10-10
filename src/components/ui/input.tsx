import * as React from "react"
import { cn } from "@/lib/utils/helpers"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm transition-all",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
          "dark:focus:ring-purple-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
