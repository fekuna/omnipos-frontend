"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LogOut, 
  Menu, 
  History, 
  Settings,
  User,
  LayoutGrid
} from "lucide-react"

export default function PosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* POS Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
        <Link href="/pos" className="flex items-center gap-2 font-semibold">
          <LayoutGrid className="h-6 w-6" />
          <span className="">OmniPOS Terminal</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-4">
                Counter 1
            </span>
            <Button variant="ghost" size="icon" title="Transactions">
                <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Customer">
                <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2" title="Back to Dashboard" asChild>
                <Link href="/">
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Dashboard</span>
                </Link>
            </Button>
        </div>
      </header>
      
      {/* Main Content Area - Scrollable if needed, but designed to be fixed */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
