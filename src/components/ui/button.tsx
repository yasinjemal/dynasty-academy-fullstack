import * as React from "react"
import { cn } from "@/lib/utils/helpers"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500":
              variant === "default",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700":
              variant === "outline",
            "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-200 dark:hover:bg-gray-700":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
              variant === "destructive",
          },
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-11 px-4 text-base": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
