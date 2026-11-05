import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "StockLedger | Beyond inventory",
  description: "Fast, simple stock management for growing businesses.",
  icons: { icon: "/stockledger-logo.png", apple: "/stockledger-logo.png" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
