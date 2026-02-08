"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Customer, ListCustomersResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  
  // Create Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  })

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const res = await api.get<ListCustomersResponse>(`/v1/customers?page=${page}&page_size=10&search=${search}`)
      setCustomers(res.data.customers || [])
      setTotal(res.data.total)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast.error("Failed to fetch customers")
    } finally {
      setIsLoading(false)
    }
  }

  // Effect for fetching
  useEffect(() => {
    const timeout = setTimeout(() => {
        fetchCustomers()
    }, 500) // Debounce search
    return () => clearTimeout(timeout)
  }, [page, search])

  // Handle Create
  const handleCreate = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
        toast.error("Name and Phone are required")
        return
    }

    try {
        setIsCreating(true)
        await api.post("/v1/customers", newCustomer)
        toast.success("Customer created successfully")
        setIsCreateOpen(false)
        setNewCustomer({ name: "", phone: "", email: "", address: "" })
        fetchCustomers()
    } catch (err) {
        console.error(err)
        toast.error("Failed to create customer")
    } finally {
        setIsCreating(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name *</Label>
                        <Input 
                            id="name" value={newCustomer.name} 
                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone *</Label>
                        <Input 
                            id="phone" value={newCustomer.phone} 
                            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                            className="col-span-3" 
                            placeholder="e.g. 08123456789"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input 
                            id="email" type="email" value={newCustomer.email} 
                            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input 
                            id="address" value={newCustomer.address} 
                            onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                            className="col-span-3" 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreate} disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Customer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
                <CardTitle>Customer List</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search name or phone..." 
                        className="pl-8" 
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1) // Reset to page 1 on search
                        }}
                    />
                </div>
           </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Joined Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No customers found.</TableCell>
                            </TableRow>
                        ) : (
                            customers.map((c, i) => (
                                <TableRow key={c.id}>
                                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.phone}</TableCell>
                                    <TableCell>{c.email || "-"}</TableCell>
                                    <TableCell className="font-bold text-primary">{c.loyalty_points}</TableCell>
                                    <TableCell>
                                        {c.created_at ? format(new Date(c.created_at), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
             {/* Pagination Controls */}
             {total > 10 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(total / 10)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={customers.length < 10 || isLoading}
                >
                    Next
                </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
