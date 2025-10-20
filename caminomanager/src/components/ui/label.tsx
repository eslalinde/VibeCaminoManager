import * as React from "react"
import { Label as RadixLabel } from "@radix-ui/react-label"

interface LabelProps extends React.ComponentProps<typeof RadixLabel> {
  htmlFor?: string;
}

const Label = React.forwardRef<
  React.ElementRef<typeof RadixLabel>,
  LabelProps
>(({ className, htmlFor, ...props }, ref) => (
  <RadixLabel
    ref={ref}
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
    {...props}
  />
))
Label.displayName = RadixLabel.displayName

export { Label }
