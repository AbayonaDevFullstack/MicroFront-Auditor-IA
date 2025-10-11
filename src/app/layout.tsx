import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthInitializer } from "@/components/providers/auth-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Auditor-IA | Sistema de Auditoría Inteligente",
  description: "Transformando la auditoría contable con inteligencia artificial para mayor precisión y eficiencia.",
  keywords: ["auditoría", "contabilidad", "inteligencia artificial", "análisis financiero"],
  authors: [{ name: "Louis Frontend Team" }],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthInitializer />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}