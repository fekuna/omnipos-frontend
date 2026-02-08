"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Category, ListCategoriesResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
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
import { CategoryForm } from "@/components/categories/CategoryForm"
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const res = await api.get<ListCategoriesResponse>("/v1/categories")
      setCategories(res.data.categories || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (data: any) => {
    try {
      if (editingCategory) {
        await api.put(`/v1/categories/${editingCategory.id}`, data)
        toast.success("Category updated successfully")
      } else {
        await api.post("/v1/categories", data)
        toast.success("Category created successfully")
      }
      setIsSheetOpen(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      await api.delete(`/v1/categories/${id}`)
      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories to organize your inventory.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open: boolean) => {
          setIsSheetOpen(open)
          if (!open) setEditingCategory(null)
        }}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingCategory ? "Edit Category" : "Add New Category"}</SheetTitle>
              <SheetDescription>
                {editingCategory ? "Update the details of your category." : "Create a new category to group your products."}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <CategoryForm 
                onSubmit={handleSubmit} 
                defaultValues={editingCategory ? {
                  name: editingCategory.name,
                  description: editingCategory.description,
                  is_active: editingCategory.is_active,
                  sort_order: editingCategory.sort_order,
                } : undefined}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsSheetOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
