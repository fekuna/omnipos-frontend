"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { ListOrdersResponse, Order, PaymentMethod } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Search } from "lucide-react"

enum OrderStatus {
  UNSPECIFIED = 0,
  PENDING = 1,
  PAID = 2,
  CANCELLED = 3,
  REFUNDED = 4,
}

// Helper for status badge
const StatusBadge = ({ status }: { status: number }) => {
  switch (status) {
    case OrderStatus.PAID:
      return <Badge className="bg-green-500">Paid</Badge>
    case OrderStatus.PENDING:
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
    case OrderStatus.CANCELLED:
      return <Badge variant="destructive">Cancelled</Badge>
    case OrderStatus.REFUNDED:
      return <Badge variant="secondary">Refunded</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

// Helper for payment method
const formatPaymentMethod = (method: PaymentMethod) => {
    switch (method) {
        case PaymentMethod.PAYMENT_METHOD_CASH: return "Cash"
        case PaymentMethod.PAYMENT_METHOD_QRIS: return "QRIS"
        case PaymentMethod.PAYMENT_METHOD_DEBIT: return "Debit"
        case PaymentMethod.PAYMENT_METHOD_CREDIT: return "Credit"
        default: return "-"
    }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await api.get<ListOrdersResponse>(`/v1/orders?page=${page}&page_size=10`)
      setOrders(res.data.orders || [])
      setTotal(res.data.total)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page]) // Re-fetch on page change

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          {/* Add Date Range Picker or Export button later */}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        {order.created_at ? format(new Date(order.created_at), "dd MMM yyyy HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {order.items?.length || 0} items
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {order.items?.map(i => i.product_name).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{formatPaymentMethod(order.payment_method)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(order.total_amount)}</TableCell>
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
                Page {page}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={orders.length < 10 || isLoading} // Simple logic, better to use total/pageSize check
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
