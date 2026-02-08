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
import { Plus, Loader2, User as UserIcon, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import { UserForm } from "@/components/settings/UserForm"
import { toast } from "sonner"
import { User, ListUsersResponse, Role, ListRolesResponse } from "@/lib/types"

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  
  const fetchData = async () => {
    try {
        const [usersRes, rolesRes] = await Promise.all([
            api.get<ListUsersResponse>("/v1/users?page=1&page_size=100"),
            api.get<ListRolesResponse>("/v1/roles?page=1&limit=100")
        ])
        
        setUsers(usersRes.data.users || [])
        setRoles(rolesRes.data.roles || [])
    } catch (err) {
        console.error(err)
        toast.error("Failed to load data")
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (data: any) => {
    setSubmitting(true)
    try {
        if (editingUser) {
            await api.put(`/v1/users/${editingUser.id}`, data)
            toast.success("User updated successfully")
        } else {
            await api.post("/v1/users", data)
            toast.success("User created successfully")
        }
        setOpen(false)
        setEditingUser(undefined)
        fetchData()
    } catch (error) {
        console.error(error)
        toast.error(editingUser ? "Failed to update user" : "Failed to create user")
    } finally {
        setSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return
    try {
        // We use delete endpoint, but backend might just soft delete
        await api.delete(`/v1/users/${id}`)
        toast.success("User deactivated")
        fetchData()
    } catch (error) {
        console.error(error)
        toast.error("Failed to deactivate user")
    }
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
        setTimeout(() => setEditingUser(undefined), 300)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">People</h2>
          <p className="text-muted-foreground">Manage staff and team members.</p>
        </div>
        
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setEditingUser(undefined)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Person
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{editingUser ? "Edit Person" : "Add Person"}</SheetTitle>
                    <SheetDescription>
                        {editingUser ? "Update profile details." : "Invite a new team member."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <UserForm 
                        onSubmit={handleSave} 
                        roles={roles}
                        isLoading={submitting}
                        isEdit={!!editingUser}
                        defaultValues={editingUser ? {
                            full_name: editingUser.full_name,
                            username: editingUser.username,
                            email: editingUser.email,
                            role_id: editingUser.role_id || editingUser.role?.id
                        } : undefined}
                    />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading people...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No people found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {user.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    {user.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                        {user.role?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    @{user.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
                        {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                            Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(user.id)}
                        >
                            Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
