"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { CookieConsent } from "@/components/layout/CookieConsent"
import { usePathname } from "next/navigation"

const NO_PUBLIC_CHROME_PREFIXES = ["/admin", "/login", "/register"]

function shouldShowPublicChrome(pathname: string | null): boolean {
  if (!pathname) return false
  return !NO_PUBLIC_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showPublicChrome = shouldShowPublicChrome(pathname)

  if (!showPublicChrome) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  )
}
