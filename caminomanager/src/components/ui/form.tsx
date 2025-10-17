import * as React from "react"
import * as Form from "@radix-ui/react-form"
import { cn } from "@/lib/utils"

const FormRoot = React.forwardRef<
  React.ElementRef<typeof Form.Root>,
  React.ComponentPropsWithoutRef<typeof Form.Root>
>(({ className, ...props }, ref) => (
  <Form.Root
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
FormRoot.displayName = "FormRoot"

const FormField = React.forwardRef<
  React.ElementRef<typeof Form.Field>,
  React.ComponentPropsWithoutRef<typeof Form.Field>
>(({ className, ...props }, ref) => (
  <Form.Field
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
))
FormField.displayName = "FormField"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Form.Label>,
  React.ComponentPropsWithoutRef<typeof Form.Label>
>(({ className, ...props }, ref) => (
  <Form.Label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Form.Control>,
  React.ComponentPropsWithoutRef<typeof Form.Control>
>(({ className, ...props }, ref) => (
  <Form.Control
    ref={ref}
    className={cn("block w-full", className)}
    {...props}
  />
))
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
  React.ElementRef<typeof Form.Message>,
  React.ComponentPropsWithoutRef<typeof Form.Message>
>(({ className, children, ...props }, ref) => (
  <Form.Message
    ref={ref}
    className={cn("text-sm text-destructive", className)}
    {...props}
  >
    {children}
  </Form.Message>
))
FormMessage.displayName = "FormMessage"

const FormSubmit = React.forwardRef<
  React.ElementRef<typeof Form.Submit>,
  React.ComponentPropsWithoutRef<typeof Form.Submit>
>(({ className, ...props }, ref) => (
  <Form.Submit
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
FormSubmit.displayName = "FormSubmit"

export {
  FormRoot,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
}