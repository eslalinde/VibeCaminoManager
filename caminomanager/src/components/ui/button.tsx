import * as React from "react"
import { Button as RadixButton, type ButtonProps as RadixButtonProps } from "@radix-ui/themes"

export interface ButtonProps extends RadixButtonProps {
  asChild?: boolean
}

function Button({ asChild, ...props }: ButtonProps) {
  return <RadixButton asChild={asChild} {...props} />
}

export { Button }
