"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { useUserStore } from "@/store/useUserStore"
import api from "@/lib/api"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setMerchant } = useUserStore()

  useEffect(() => {
    // Fetch current merchant info on mount
    const fetchMerchant = async () => {
        try {
            const res = await api.get("/v1/merchant/current")
            setMerchant(res.data)
        } catch (error) {
            console.error("Failed to fetch merchant profile", error)
        }
    }
    fetchMerchant()
  }, [setMerchant])

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40 text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
