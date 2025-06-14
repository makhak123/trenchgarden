import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

export const metadata = {
  title: "Trench Garden",
  description: "Grow your own virtual garden with Trench Garden tokens",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/Geist-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeistMono-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
