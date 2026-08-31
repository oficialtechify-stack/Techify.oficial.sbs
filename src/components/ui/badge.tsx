import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "muted"
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = 
    variant === "default" 
      ? "border-transparent bg-[#22c55e] text-black hover:bg-[#22c55e]/80"
      : variant === "secondary" || variant === "muted"
      ? "border-transparent bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
      : variant === "outline"
      ? "border-neutral-700 text-neutral-300"
      : "border-transparent bg-red-600 text-white";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
