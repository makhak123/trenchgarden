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
        {/* Updated CSP meta tag to allow unsafe-eval for Three.js and framer-motion */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; style-src 'self' 'unsafe-inline' blob: data:; img-src 'self' data: blob: https: http:; font-src 'self' data: blob:; connect-src 'self' blob: data: https: wss: ws:; worker-src 'self' blob: data:; child-src 'self' blob: data:; frame-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'none';"
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
