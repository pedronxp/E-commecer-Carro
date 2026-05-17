"use client"

import { useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set("search", value)
        } else {
          params.delete("search")
        }
        router.push(`/carros?${params.toString()}`)
      }, 300)
    },
    [router, searchParams],
  )

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <Input
        icon={<Search className="h-4 w-4" />}
        placeholder="Procure por modelo, marca ou versão"
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full"
      />
    </form>
  )
}
