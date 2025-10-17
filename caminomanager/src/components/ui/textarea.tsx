import * as React from "react"
import { TextArea as RadixTextArea } from "@radix-ui/themes"

export interface TextareaProps
  extends React.ComponentProps<typeof RadixTextArea> {}

const Textarea = React.forwardRef<
  React.ElementRef<typeof RadixTextArea>,
  TextareaProps
>((props, ref) => {
  return <RadixTextArea ref={ref} {...props} />
})
Textarea.displayName = "Textarea"

// Re-export the primitive for consistency with other components
const TextareaPrimitive = Textarea

export { Textarea, TextareaPrimitive } 