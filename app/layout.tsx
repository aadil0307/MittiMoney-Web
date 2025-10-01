import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { OfflineProvider } from "@/components/offline-manager"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MittiMoney - Your Financial Companion",
  description:
    "Empowering financial discipline and resilience for India's households through voice-first, intuitive financial management.",
  keywords: "finance, savings, debt management, voice-first, India, financial literacy",
  authors: [{ name: "MittiMoney Team" }],
  generator: 'v0.app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#D26A4C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        <div id="root" className="relative">
          <AuthProvider>
            <LanguageProvider>
              <OfflineProvider>{children}</OfflineProvider>
            </LanguageProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
