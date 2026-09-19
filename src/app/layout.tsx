// src/app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import ThemeProvider from "@/components/theme/ThemeProvider"
import ThemeSettingsProvider from "@/components/theme/ThemeSettingsProvider"
import { ThemeTransitionProvider } from "@/components/theme/ThemeTransitionOverlay"
import { Toaster } from "@/components/ui/sonner"
import { IdleTimer } from "@/components/auth/IdleTimer"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "VOS ERP | Human Resource Management",
    description: "Premium Enterprise Human Resource Management System",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                <ThemeProvider>
                    <ThemeSettingsProvider>
                        <ThemeTransitionProvider>
                            {children}
                        </ThemeTransitionProvider>
                    </ThemeSettingsProvider>

                    {/* Global session monitor */}
                    <IdleTimer />

                    {/* Global toast host (Sonner / shadcn) */}
                    <Toaster position="top-right" richColors />
                </ThemeProvider>
            </body>
        </html>
    )
}

