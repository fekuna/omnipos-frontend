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
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import { ProductForm } from "@/components/products/ProductForm"
import { toast } from "sonner"
import { Product, ListProductsResponse } from "@/lib/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const fetchProducts = async () => {
    setLoading(true)
    try {
        const queryParams = new URLSearchParams({
            page: "1",
            page_size: "100" // Fetch more for client-side search/demo
        })
        if (search) {
            queryParams.append("query", search)
            // If using search endpoint: /v1/products/search?query=...
            // But ListProducts also supports filters if implemented.
            // Let's rely on client side filtering or basic list for now as search endpoint might differ
        }
        
      const res = await api.get<ListProductsResponse>(`/v1/products?${queryParams.toString()}`)
      
      // If we used the search endpoint it would be different, but let's assume standard list for now
      // If user types in search box, we might want to trigger actual search explicitly
        setProducts(res.data.products || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleSave = async (data: any) => {
    try {
        if (editingProduct) {
             await api.put(`/v1/products/${editingProduct.id}`, data)
             toast.success("Product updated successfully")
        } else {
             await api.post("/v1/products", data)
             toast.success("Product created successfully")
        }
        setOpen(false)
        setEditingProduct(undefined)
        fetchProducts()
    } catch (error) {
        console.error(error)
        toast.error(editingProduct ? "Failed to update product" : "Failed to create product")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
        await api.delete(`/v1/products/${id}`)
        toast.success("Product deleted")
        fetchProducts()
    } catch (error) {
        console.error(error)
        toast.error("Failed to delete product")
    }
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
        // Reset editing state when sheet closes
        setTimeout(() => setEditingProduct(undefined), 300) // Small delay for animation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setEditingProduct(undefined)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{editingProduct ? "Edit Product" : "Create Product"}</SheetTitle>
                    <SheetDescription>
                        {editingProduct ? "Update product details." : "Add a new product to your catalog."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <ProductForm 
                        onSubmit={handleSave} 
                        defaultValues={editingProduct ? {
                            name: editingProduct.name,
                            sku: editingProduct.sku,
                            base_price: editingProduct.base_price,
                            cost_price: editingProduct.cost_price,
                            description: editingProduct.description,
                            category_id: editingProduct.category_id || editingProduct.category?.id, // Handle joined or raw
                            image_url: editingProduct.image_url,
                            track_inventory: editingProduct.track_inventory,
                            has_variants: editingProduct.has_variants
                        } : undefined}
                    />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading catalog...
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs font-bold">
                            {product.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>${product.base_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                            Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled title="Coming Soon">
                            Manage Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(product.id)}
                        >
                            Delete
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
