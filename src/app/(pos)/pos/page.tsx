"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Category, ListCategoriesResponse, ListProductsResponse, Product, Customer, ListCustomersResponse } from "@/lib/types" // Added Customer, ListCustomersResponse
import { useCartStore } from "@/store/useCartStore"
import { useUserStore } from "@/store/useUserStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Minus, Trash2, CreditCard, Loader2 } from "lucide-react" // Added Loader2
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentMethod, CreateOrderResponse, CreatePaymentRequest, Order } from "@/lib/types"
import { CheckCircle } from "lucide-react"


export default function PosPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAYMENT_METHOD_CASH)
  const [successOpen, setSuccessOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)

  const { items, addToCart, removeFromCart, updateQuantity, total, clearCart } = useCartStore()
  const { user } = useUserStore()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [catRes, prodRes] = await Promise.all([
            api.get<ListCategoriesResponse>("/v1/categories"),
            api.get<ListProductsResponse>("/v1/products?page=1&page_size=100") // Fetch enough for POS
        ])
        
        setCategories(catRes.data.categories || [])
        setProducts(prodRes.data.products || [])
        setFilteredProducts(prodRes.data.products || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load POS data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter logic
  useEffect(() => {
    let result = products

    if (selectedCategory !== "all") {
        result = result.filter(p => p.category_id === selectedCategory)
    }

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase()
        result = result.filter(p => 
            p.name.toLowerCase().includes(lowerQ) || 
            p.sku.toLowerCase().includes(lowerQ)
        )
    }

    setFilteredProducts(result)
  }, [searchQuery, selectedCategory, products])

  // Customer Search State
  const { customer_id, setCustomer: setStoreCustomer } = useCartStore()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [customerQuery, setCustomerQuery] = useState("")
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  // Search Customers
  useEffect(() => {
    const searchCustomers = async () => {
        if (!customerQuery) {
            setCustomerResults([])
            return
        }
        try {
            setIsSearchingCustomer(true)
            const res = await api.get<ListCustomersResponse>(`/v1/customers?page=1&page_size=5&search=${customerQuery}`)
            setCustomerResults(res.data.customers || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsSearchingCustomer(false)
        }
    }

    const timeout = setTimeout(searchCustomers, 300)
    return () => clearTimeout(timeout)
  }, [customerQuery])

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c)
    setStoreCustomer(c.id)
    setCustomerSearchOpen(false)
    toast.success(`Customer ${c.name} selected`)
  }

  const removeCustomer = () => {
    setSelectedCustomer(null)
    setStoreCustomer(null)
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
        setIsLoading(true)
        
        // 1. Create Order

        const orderPayload = {
            payment_method: paymentMethod, 
            paid_amount: total(),
            customer_id: customer_id || undefined,
            cashier_id: user?.id, // Add Cashier ID
            items: items.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.base_price,
                notes: ""
            }))
        }

        const orderRes = await api.post<CreateOrderResponse>("/v1/orders", orderPayload)
        const order = orderRes.data.order
        
        // 2. Create Payment Record
        // In a real app, you might process cards here before optimizing
        const paymentPayload: CreatePaymentRequest = {
            order_id: order.id,
            amount: order.total_amount, // Use server-calculated total
            payment_method: paymentMethod,
            provider: "SYSTEM_POS", // Optional
            reference_number: `REF-${Date.now()}` // Mock ref
        }
        
        await api.post("/v1/payments", paymentPayload)

        // 3. Success
        setLastOrder(order)
        setSuccessOpen(true)
        toast.success("Payment successful!")
        
        clearCart() 
        setSelectedCustomer(null)
        setPaymentMethod(PaymentMethod.PAYMENT_METHOD_CASH) // Reset
    } catch (err) {
        console.error(err)
        toast.error("Transaction failed")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* LEFT: Product Catalog */}
      <div className="flex flex-1 flex-col border-r bg-muted/10">
        
        {/* Search & Category Tabs */}
        {/* ... (Existing code) ... */}
        <div className="px-4 py-4 space-y-4">
             {/* ... Search Input ... */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {/* ... Categories ... */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 pb-2">
                    <Button 
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedCategory("all")}
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1 px-4 pb-4">
           {/* ... (Existing Grid) ... */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <Card 
                        key={product.id} 
                        className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                        onClick={() => addToCart(product)}
                    >
                        <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground relative overflow-hidden">
                            {product.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold">{product.name.charAt(0)}</span>
                            )}
                        </div>
                        <CardContent className="p-3">
                            <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                            <p className="text-sm text-primary font-bold mt-1">
                                {formatCurrency(product.base_price)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredProducts.length === 0 && !isLoading && (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                    No products found.
                </div>
            )}
        </ScrollArea>
      </div>


      {/* RIGHT: Cart Panel */}
      <div className="flex w-[400px] flex-col bg-background shadow-xl">
        <div className="flex h-14 items-center justify-between border-b px-4">
            <h2 className="font-semibold">Current Order</h2>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                Clear
            </Button>
        </div>

        {/* Customer Selection */}
        <div className="px-4 py-3 border-b bg-muted/20">
            {selectedCustomer ? (
                <div className="flex items-center justify-between bg-primary/10 p-2 rounded-md border border-primary/20">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Customer</span>
                        <span className="font-medium text-sm">{selectedCustomer.name}</span>
                        <span className="text-xs text-muted-foreground">{selectedCustomer.loyalty_points} Points</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={removeCustomer}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Dialog open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-between" size="sm">
                            <span className="text-muted-foreground">Select Customer (Optional)</span>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Customer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search name or phone..." 
                                    className="pl-8" 
                                    value={customerQuery}
                                    onChange={(e) => setCustomerQuery(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {isSearchingCustomer ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5" /></div>
                                ) : customerResults.map(c => (
                                    <div 
                                        key={c.id} 
                                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer border"
                                        onClick={() => selectCustomer(c)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{c.name}</span>
                                            <span className="text-xs text-muted-foreground">{c.phone}</span>
                                        </div>
                                        <div className="text-xs font-bold text-primary">
                                            {c.loyalty_points} pts
                                        </div>
                                    </div>
                                ))}
                                {!isSearchingCustomer && customerResults.length === 0 && customerQuery && (
                                    <div className="text-center text-sm text-muted-foreground p-4">No customers found</div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>

        <ScrollArea className="flex-1 p-4">
            {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard className="h-8 w-8 opacity-50" />
                    </div>
                    <p>Cart is empty</p>
                    <p className="text-xs text-center max-w-[200px]">Select products from the left to add them to the order.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-medium truncate">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">{formatCurrency(item.base_price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" size="icon" className="h-7 w-7 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                                <Button 
                                    variant="outline" size="icon" className="h-7 w-7 rounded-full"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="text-right w-16 font-medium">
                                {formatCurrency(item.base_price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>

        <div className="border-t bg-muted/10 p-4 space-y-4">
            {/* Payment Method Selector */}
            <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant={paymentMethod === PaymentMethod.PAYMENT_METHOD_CASH ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPaymentMethod(PaymentMethod.PAYMENT_METHOD_CASH)}
                        className="w-full"
                    >
                        Cash
                    </Button>
                    <Button 
                        variant={paymentMethod === PaymentMethod.PAYMENT_METHOD_QRIS ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPaymentMethod(PaymentMethod.PAYMENT_METHOD_QRIS)}
                        className="w-full"
                    >
                        QRIS
                    </Button>
                    <Button 
                        variant={paymentMethod === PaymentMethod.PAYMENT_METHOD_DEBIT ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPaymentMethod(PaymentMethod.PAYMENT_METHOD_DEBIT)}
                        className="w-full"
                    >
                        Debit
                    </Button>
                    <Button 
                        variant={paymentMethod === PaymentMethod.PAYMENT_METHOD_CREDIT ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPaymentMethod(PaymentMethod.PAYMENT_METHOD_CREDIT)}
                        className="w-full"
                    >
                        Credit
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total())}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(0)}</span>
                </div>
                {/* Discount */}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total())}</span>
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleCheckout} disabled={items.length === 0}>
                Checkout {items.length > 0 && `(${formatCurrency(total())})`}
            </Button>
        </div>
      </div>
      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    Payment Successful
                </DialogTitle>
                <DialogDescription>
                    Transaction completed successfully.
                </DialogDescription>
            </DialogHeader>
            {lastOrder && (
                <div className="space-y-4 py-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Order Number</span>
                        <span className="font-mono">{lastOrder.order_number}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">
                            {lastOrder.payment_method === PaymentMethod.PAYMENT_METHOD_CASH ? "Cash" :
                             lastOrder.payment_method === PaymentMethod.PAYMENT_METHOD_QRIS ? "QRIS" : 
                             "Card"}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Paid</span>
                        <span>{formatCurrency(lastOrder.total_amount)}</span>
                    </div>
                    {/* Show Change only if Cash */}
                    {lastOrder.payment_method === PaymentMethod.PAYMENT_METHOD_CASH && lastOrder.change_amount > 0 && (
                        <div className="flex justify-between text-lg font-bold text-orange-600">
                            <span>Change</span>
                            <span>{formatCurrency(lastOrder.change_amount)}</span>
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setSuccessOpen(false)} className="w-full">
                    Start New Order
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
