"use client"

import { useAuth, useRequestPasswordReset } from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export type ForgotPasswordProps = {
  className?: string
}

/**
 * Render a card-based "Forgot Password" form that sends a password-reset email.
 *
 * The form displays an email input, submit button, and a link back to sign-in.
 * Toasts are displayed on success or error via the `useForgotPassword` hook.
 *
 * @param className - Optional additional CSS class names applied to the card
 * @returns The forgot-password form UI as a JSX element
 */
export function ForgotPassword({ className }: ForgotPasswordProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()

  const { mutateAsync: requestPasswordReset, isPending } = useRequestPasswordReset({
    onSuccess: () => {
      // Side effects like navigation can stay here, but success toast is handled by promise
    }
  })

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const promise = requestPasswordReset({ 
      email: formData.get("email") as string,
      redirectTo: "/auth/reset-password"
    })

    toast.promise(promise, {
      loading: "Sending reset link...",
      success: "Reset link sent to your email!",
      error: (error) => error.error?.message || error.message || "Failed to send reset link"
    })
  }

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
  }>({})

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.forgotPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">{localization.auth.email}</Label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={localization.auth.emailPlaceholder}
                required
                disabled={isPending}
                onChange={() => {
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: undefined
                  }))
                }}
                onInvalid={(e) => {
                  e.preventDefault()

                  setFieldErrors((prev) => ({
                    ...prev,
                    email: (e.target as HTMLInputElement).validationMessage
                  }))
                }}
                aria-invalid={!!fieldErrors.email}
              />

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}

                {localization.auth.sendResetLink}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              // href={`${viewPaths.auth.signIn}`}
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
