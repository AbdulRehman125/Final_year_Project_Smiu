"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const { data: session } = useSession();

  return (
    <section className="py-12 md:py-18 bg-[#fbfcfd] dark:bg-background px-4 md:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              "linear-gradient(135deg, rgba(45, 156, 219, 0.06) 0%, rgba(30, 136, 229, 0.02) 50%, rgba(45, 156, 219, 0.08) 100%)",
          }}
          className="relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-sky-100/80 dark:border-slate-800 px-4 py-8 md:py-14 text-center shadow-[0_2px_16px_rgba(0,0,0,0.02)] dark:bg-slate-900/60"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative drop-shadow-[0_10px_25px_rgba(2,132,199,0.25)]">
              <Image
                src="/logo.png"
                alt="AI IELTS Logo"
                width={84}
                height={84}
                className="w-24 h-24 md:w-40 md:h-40 object-contain rounded-2xl"
                priority
              />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl lg:text-[36px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
            START YOUR IELTS JOURNEY TODAY
          </h2>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed mb-8">
            Join thousands of students who are already improving their IELTS scores with AI-powered practice.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all hover:shadow-lg"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="auth/sign-up"
                  className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all hover:shadow-lg"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="auth/sign-in"
                  className="inline-flex items-center justify-center bg-[#e2e8f0]/80 hover:bg-[#cbd5e1] text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full border border-slate-300/40 dark:border-slate-700 transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}


