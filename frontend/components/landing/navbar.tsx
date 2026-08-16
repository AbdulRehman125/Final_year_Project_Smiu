"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart3,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features", icon: Sparkles },
    { name: "Modules", href: "/#modules", icon: BookOpen },
    { name: "How It Works", href: "/#how-it-works", icon: HelpCircle },
    // { name: "Analytics", href: "/#progress-tracking", icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="IELTS Ace Logo"
            width={34}
            height={34}
            className="w-10 h-10 md:w-14 md:h-14 object-contain"
          />
          <span className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            IELTS<span className="text-sky-500 ml-2">Ace</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <AnimatedThemeToggler
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            variant="circle"
            duration={500}
          />

          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="bg-sky-100 text-sky-700 font-bold text-xs">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-lg">
                <div className="px-2 py-1.5">
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {session.user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {session.user.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer text-xs font-medium py-2 rounded-xl">
                    <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                {(session.user as any).role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer text-xs font-medium py-2 rounded-xl text-sky-600 dark:text-sky-400">
                      <Sliders className="mr-2 h-3.5 w-3.5" />
                      System Settings
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-xs font-medium text-red-600 dark:text-red-400 py-2 rounded-xl focus:bg-red-50 dark:focus:bg-red-950/40"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="auth/sign-in"
                className="text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-4 py-2 rounded-full transition-colors"
              >
                Log In
              </Link>

              <Link
                href="auth/sign-up"
                className="inline-flex items-center justify-center bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <AnimatedThemeToggler
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            variant="circle"
            duration={500}
          />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-[340px] p-6 flex flex-col justify-between bg-white dark:bg-card border-l border-slate-200/80 dark:border-slate-800 shadow-2xl"
            >
              <div>
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <Image
                      src="/logo.png"
                      alt="IELTS Ace Logo"
                      width={30}
                      height={30}
                      className="w-7 h-7 object-contain rounded-lg"
                    />
                    <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                      IELTS<span className="text-sky-500">Ace</span>
                    </span>
                  </Link>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1.5 pt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      <link.icon className="h-4 w-4 text-sky-500 shrink-0" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Auth / Actions Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name}
                        />
                        <AvatarFallback className="bg-sky-100 text-sky-700 font-bold text-xs">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full h-11 rounded-full font-semibold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm transition-all"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </Link>

                    {(session.user as any).role === "admin" && (
                      <Link
                        href="/admin/settings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full h-11 rounded-full font-semibold text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-all"
                      >
                        <Sliders className="h-4 w-4" />
                        System Settings
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center justify-center gap-2 w-full h-10 rounded-full font-semibold text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full h-11 rounded-full font-semibold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors"
                    >
                      Log In
                    </Link>

                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full h-11 rounded-full font-semibold text-xs text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}