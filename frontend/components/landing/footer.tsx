"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pb-12 pt-4 bg-[#fbfcfd] dark:bg-background px-4 md:px-6">
      <div className="container mx-auto">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[30px] px-6 md:px-10 py-6 md:py-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
          {/* Top Row: Brand, Nav Links, Social Icons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="IELTS Ace Logo"
                width={34}
                height={34}
                className="w-12 h-12 md:w-14 md:h-14  "
              />
              <span className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                IELTS<span className="text-sky-500 ml-2">Ace</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 md:gap-8 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link
                href="/#features"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#modules"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Modules
              </Link>
              <Link
                href="/#how-it-works"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                How It Works
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-12 h-12 rounded-full bg-slate-100/90 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all group"
              >
                <Image
                  src="/twitter.png"
                  alt="Twitter"
                  width={15}
                  height={15}
                  className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 rounded-full bg-slate-100/90 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all group"
              >
                <Image
                  src="/github.png"
                  alt="GitHub"
                  width={15}
                  height={15}
                  className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-slate-100/90 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all group"
              >
                <Image
                  src="/linkdin.png"
                  alt="LinkedIn"
                  width={15}
                  height={15}
                  className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 my-5 md:my-6" />

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] md:text-xs text-slate-400 dark:text-slate-500">
            <p>© {currentYear} IELTS AI. All rights reserved.</p>
            <p>Built with AI-powered technology</p>
          </div>
        </div>
      </div>
    </footer>
  );
}


