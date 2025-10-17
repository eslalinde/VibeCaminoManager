import * as React from "react"
import { Select as RadixSelect } from "@radix-ui/themes"

// Re-export the official Radix UI Themes Select components
export const Select = RadixSelect.Root
export const SelectGroup = RadixSelect.Group
export const SelectTrigger = RadixSelect.Trigger
export const SelectContent = RadixSelect.Content
export const SelectLabel = RadixSelect.Label
export const SelectItem = RadixSelect.Item
export const SelectSeparator = RadixSelect.Separator

// SelectValue is not needed in Radix UI Themes as the trigger automatically displays the value
// This is kept for backward compatibility with existing code
const SelectValue = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>((props, ref) => {
  return <RadixSelect.Trigger ref={ref} {...props} />
})
SelectValue.displayName = "SelectValue"

// Placeholder components for backward compatibility (if needed)
const SelectScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
)
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
)
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export { SelectValue, SelectScrollUpButton, SelectScrollDownButton } 