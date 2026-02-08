"use client";

import { useEffect, useState } from "react";
import { DollarSign, CreditCard, ShoppingBag, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

import api from "@/lib/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  salesChart: { date: string; total: number }[];
  topProducts: { productName: string; salesCount: number; revenue: number }[];
  recentTransactions: any[]; 
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<DashboardStats>("/v1/dashboard/stats");
        console.log("Dashboard Stats Response:", res);
        console.log("Dashboard Stats Data:", res.data);
        console.log("Sales Chart Data:", res.data?.salesChart);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  // Format data for components
  const chartData = stats?.salesChart?.map(s => ({ name: s.date, total: s.total })) || [];
  
  const topProductsData = stats?.topProducts?.map(p => ({
    name: p.productName,
    sales: p.salesCount,
    revenue: `$${p.revenue.toFixed(2)}`
  })) || [];


  const recentData = stats?.recentTransactions?.map(t => ({
    customer: t.customer_id || "Guest", // Map customer info? ID is returned. Need to join? Backend returned raw order.
    amount: `$${t.totalAmount}`,
    status: t.status === "ORDER_STATUS_PAID" ? "Completed" : t.status,
    date: new Date(t.createdAt).toLocaleTimeString()
  })) || [];

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
          trend="+0% (vs last period)" 
          trendUp={true} 
          description="Real-time"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Total Orders" 
          value={(stats?.totalOrders ?? 0).toString()} 
          trend="+0%" 
          trendUp={true} 
          description="Real-time"
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Items Sold" 
          value={(stats?.totalItemsSold ?? 0).toString()} 
          trend="+0%" 
          trendUp={true} 
          description="Real-time"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Active Users" 
          value="-" 
          trend="" 
          trendUp={true} 
          description="Not tracked"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {(chartData && chartData.length > 0) ? (
          <SalesChart data={chartData} />
        ) : (
          <div className="col-span-4 flex items-center justify-center h-[350px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-muted-foreground">
            No sales data available (Chart Empty)
          </div>
        )}
        {(topProductsData && topProductsData.length > 0) ? (
          <TopProducts data={topProductsData} />
        ) : (
           <div className="col-span-3 flex items-center justify-center h-[350px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-muted-foreground">
            No top products data
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {(recentData && recentData.length > 0) ? (
          <RecentTransactions data={recentData} />
        ) : (
           <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-muted-foreground">
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
}
