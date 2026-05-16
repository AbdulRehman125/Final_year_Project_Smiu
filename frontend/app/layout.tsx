// import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google"

// import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { cn } from "@/lib/utils";
// import TRPCProvider from "@/components/trpc-provider";
// import { Toaster } from "@/components/ui/sonner";

// const geistMonoHeading = Geist_Mono({subsets:['latin'],variable:'--font-heading'});

// const robotoSlab = Roboto_Slab({subsets:['latin'],variable:'--font-serif'});

// const fontSans = Geist({
//   subsets: ["latin"],
//   variable: "--font-sans",
// })

// const fontMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
// })

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning
//       className={cn("antialiased", fontSans.variable, fontMono.variable, "font-serif", robotoSlab.variable, geistMonoHeading.variable)}
//     >
//       <body>
//           <ThemeProvider>
//             <TRPCProvider>
//               {children}
//               <Toaster />
//             </TRPCProvider>
//           </ThemeProvider>
//       </body>
//     </html>
//   )
// }










import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import TRPCProvider from "@/components/trpc-provider";
import { Toaster } from "@/components/ui/sonner";

const geistMonoHeading = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-serif",
        robotoSlab.variable,
        geistMonoHeading.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}