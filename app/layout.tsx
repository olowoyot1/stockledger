import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "StockLedger | Beyond inventory",
  description: "Fast, simple stock management for growing businesses.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
