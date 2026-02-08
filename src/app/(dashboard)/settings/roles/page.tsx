"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { RoleForm } from "@/components/settings/RoleForm"
import { toast } from "sonner"
import { Role, ListRolesResponse, ListPermissionsResponse, Permission } from "@/lib/types"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const fetchRoles = async () => {
    try {
        const res = await api.get<ListRolesResponse>("/v1/roles?page=1&limit=100")
        setRoles(res.data.roles || [])
    } catch (err) {
        console.error(err)
        toast.error("Failed to load roles")
    }
  }

  const fetchPermissions = async () => {
    try {
        const res = await api.get<ListPermissionsResponse>("/v1/permissions")
        setPermissions(res.data.permissions || [])
    } catch (err) {
        console.error(err)
        toast.error("Failed to load permissions")
    }
  }

  useEffect(() => {
    const init = async () => {
        setLoading(true)
        await Promise.all([fetchRoles(), fetchPermissions()])
        setLoading(false)
    }
    init()
  }, [])

  const handleSave = async (data: any) => {
    setSubmitting(true)
    try {
        await api.post("/v1/roles", data)
        toast.success("Role created successfully")
        setOpen(false)
        fetchRoles()
    } catch (error) {
        console.error(error)
        toast.error("Failed to create role")
    } finally {
        setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage access levels for your staff.</p>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create Role</SheetTitle>
                    <SheetDescription>
                        Define a new role and assign permissions.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <RoleForm 
                        onSubmit={handleSave} 
                        permissions={permissions}
                        isLoading={submitting}
                    />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading roles...
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {role.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{role.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions?.length || 0} permissions</Badge>
                  </TableCell>
                  <TableCell>
                    {role.is_system ? (
                        <Badge variant="secondary">System</Badge>
                    ) : (
                        <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
