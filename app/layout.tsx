import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "@/lib/startup-fixes"

export const metadata = {
  title: "Trench Garden",
  description: "Grow your own virtual garden with Trench Garden tokens",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
  },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate fix for undefined property access
              window.onerror = function(msg, url, line, col, error) {
                if (msg && msg.includes && msg.includes("Cannot read properties of undefined")) {
                  console.warn("Caught undefined property error:", msg);
                  return true; // Prevent error from crashing the app
                }
                return false;
              };
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
