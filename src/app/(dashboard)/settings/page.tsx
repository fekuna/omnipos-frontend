"use client"

import Link from "next/link"
import { 
    Users, 
    Shield, 
    Store,
    CreditCard
} from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Protect } from "@/components/auth/Protect"

const settingsItems = [
    {
        title: "People",
        description: "Manage staff members and their access.",
        icon: Users,
        href: "/settings/people",
    },
    {
        title: "Roles & Permissions",
        description: "Configure roles and access levels.",
        icon: Shield,
        href: "/settings/roles",
    },
    {
        title: "Store Profile",
        description: "Manage store details and business hours.",
        icon: Store,
        href: "/stores", // Redirects to stores for now
    },
    {
        title: "Payment Methods",
        description: "Configure accepted payment types.",
        icon: CreditCard,
        href: "/settings/payments", // Future
        disabled: true
    }
]

export default function SettingsPage() {
  return (
    <Protect permission="settings:read" fallback={<div className="p-8 text-center text-red-500">Access Restricted</div>}>
      <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and business preferences.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsItems.map((item) => (
            <Link key={item.href} href={item.disabled ? "#" : item.href} className={item.disabled ? "cursor-not-allowed opacity-60" : "hover:scale-[1.01] transition-transform"}>
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="grid gap-1">
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
        ))}
      </div>
      </div>
    </Protect>
  )
}
