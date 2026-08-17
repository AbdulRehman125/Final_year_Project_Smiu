import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { resend } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      const resetUrl = url.includes("/auth/reset-password")
        ? url
        : url.replace("/reset-password", "/auth/reset-password");
      const { error } = await resend.emails.send({
        from: "AI IELTS <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1a202c; margin-bottom: 24px;">Reset Your Password</h2>
            <p style="color: #4a5568; line-height: 1.6;">Hello,</p>
            <p style="color: #4a5568; line-height: 1.6;">We received a request to reset your password for your AI IELTS account. Click the button below to set a new password:</p>
            <div style="margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #718096; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #a0aec0; font-size: 12px;">AI IELTS - Your AI-powered IELTS preparation partner</p>
          </div>
        `,
      });

      if (error) {
        console.error("Failed to send reset password email:", error);
      }
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
});