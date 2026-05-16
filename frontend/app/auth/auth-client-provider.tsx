"use client";

import { AuthProvider } from "@/components/auth-provider";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export function AuthClientProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      authClient={authClient}
      emailAndPassword={{
        forgotPassword: true,
      }}
      viewPaths={{
        auth: {
          signIn: "/sign-in",
          signUp: "/sign-up",
          forgotPassword: "/forgot-password",
          resetPassword: "/reset-password",
        },
      }}
      navigate={(options) => {
        if (options.replace) {
          router.replace(options.to);
        } else {
          router.push(options.to);
        }
      }}
    >
      {children}
    </AuthProvider>
  );
}
