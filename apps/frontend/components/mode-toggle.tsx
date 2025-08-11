"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const current = resolvedTheme || theme

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(current === "light" ? "dark" : "light")}
      aria-label="切換主題"
      className='ml-3'
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
