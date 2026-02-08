"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/useUserStore"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { merchant, logout, hasPermission } = useUserStore()
  const [collapsed, setCollapsed] = React.useState(false)

  const links = [
    { href: "/pos", label: "POS Terminal", icon: Store, permission: "pos:access" },
    { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:read" },
    { href: "/products", label: "Products", icon: Package, permission: "product:read" },
    { href: "/categories", label: "Categories", icon: LayoutGrid, permission: "category:read" },
    { href: "/orders", label: "Orders", icon: ShoppingCart, permission: "order:read" },
    { href: "/customers", label: "Customers", icon: Users, permission: "customer:read" },
    { href: "/stores", label: "Stores", icon: Store, permission: "store:read" },
    { href: "/settings", label: "Settings", icon: Settings, permission: "settings:read" },
  ]

  const filteredLinks = links.filter(link => !link.permission || hasPermission(link.permission))

  const handleLogout = () => {
    logout()
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/login"
  }

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-tr from-primary to-purple-600 bg-clip-text text-transparent">
            OmniPOS
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {filteredLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
           <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {merchant?.name?.charAt(0) || "M"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{merchant?.name || "Merchant"}</span>
              <span className="truncate text-xs text-muted-foreground">{merchant?.phone || ""}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
             <Button 
                variant="ghost" 
                className={cn(
                    "w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    collapsed && "justify-center px-2"
                )}
                onClick={handleLogout}
            >
                <LogOut className="h-4 w-4" />
                {!collapsed && "Logout"}
            </Button>
        </div>
      </div>
    </div>
  )
}
