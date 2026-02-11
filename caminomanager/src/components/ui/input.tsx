import * as React from "react"
import { TextField } from "@radix-ui/themes"
import { Responsive } from "@radix-ui/themes/props"

interface InputProps extends Omit<React.ComponentProps<"input">, 'size'> {
  size?: Responsive<"1" | "2" | "3">
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = "2", placeholder, value, onChange, disabled, required, maxLength, minLength, className, type, name, id, ...props }, ref) => {
    return (
      <TextField.Root
        ref={ref}
        radius="large"
        placeholder={placeholder}
        size={size}
        value={value as string}
        onChange={onChange}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        className={className}
        type={type as React.ComponentProps<typeof TextField.Root>["type"]}
        name={name}
        id={id}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
