"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Store as StoreIcon, Loader2, Edit, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { toast } from "sonner"
import api from "@/lib/api"
import { format } from "date-fns"

// Types (should be moved to types.ts later)
interface Store {
    id: string
    merchant_id: string
    name: string
    address: string
    phone: string
    created_at: string
}

interface CreateStoreRequest {
    name: string
    address: string
    phone: string
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState<CreateStoreRequest>({
        name: "",
        address: "",
        phone: ""
    })

    const fetchStores = async () => {
        try {
            setIsLoading(true)
            const res = await api.get<{ stores: Store[], total: number }>("/v1/stores?page=1&page_size=100")
            setStores(res.data.stores || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load stores")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    const handleCreate = async () => {
        if (!formData.name) return toast.error("Store name is required")
        
        try {
            setIsSubmitting(true)
            await api.post("/v1/stores", formData)
            toast.success("Store created successfully")
            setIsDialogOpen(false)
            setFormData({ name: "", address: "", phone: "" })
            fetchStores()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create store")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
                    <p className="text-muted-foreground">Manage your store locations.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Store
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Store</DialogTitle>
                            <DialogDescription>
                                Create a new store location for your business.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Store Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Central Branch" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input 
                                    id="phone" 
                                    placeholder="e.g. 021-555-0123" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input 
                                    id="address" 
                                    placeholder="e.g. 123 Main St, Jakarta" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Store
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Stores</CardTitle>
                    <CardDescription>
                        List of all registered store locations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
                    ) : stores.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No stores found. Create your first store!
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nam</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <StoreIcon className="h-4 w-4 text-muted-foreground" />
                                            {store.name}
                                        </TableCell>
                                        <TableCell>{store.phone || "-"}</TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={store.address}>
                                            {store.address || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {store.created_at ? format(new Date(store.created_at), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
