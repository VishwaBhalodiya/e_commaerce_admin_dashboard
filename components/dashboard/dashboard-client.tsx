"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  RefreshCw, 
  Package, 
  DollarSign, 
  AlertTriangle,
  FolderOpen,
  TrendingUp
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Types
interface DashboardStats {
  totalProducts: number
  totalRevenue: number
  lowStockCount: number
  totalCategories: number
  categoryStats: { name: string; count: number }[]
  stockStats: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
  recentProducts: any[]
}

interface DashboardClientProps {
  initialData: DashboardStats
}

// Fetch function
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  return response.json()
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    initialData: initialData,
    refetchInterval: 30000,
    staleTime: 10000,
  })

  const stats = [
    {
      title: "Total Products",
      value: data?.totalProducts || 0,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Revenue",
      value: `$${(data?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Low Stock Items",
      value: data?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      title: "Categories",
      value: data?.totalCategories || 0,
      icon: FolderOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ]

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

  const stockChartData = [
    { name: "In Stock", value: data?.stockStats?.inStock || 0, fill: "#10B981" },
    { name: "Low Stock", value: data?.stockStats?.lowStock || 0, fill: "#F59E0B" },
    { name: "Out of Stock", value: data?.stockStats?.outOfStock || 0, fill: "#EF4444" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                  >
                    {data.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Stock Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Products</CardTitle>
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recentProducts && data.recentProducts.length > 0 ? (
            <div className="space-y-4">
              {data.recentProducts.map((product: any) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category || "No category"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              No products yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link 
            href="/dashboard/products/new" 
            className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <div className="font-medium text-blue-600">➕ Add New Product</div>
            <div className="text-sm text-gray-500">Create a new product listing</div>
          </Link>
          <Link 
            href="/dashboard/products" 
            className="block p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
          >
            <div className="font-medium text-green-600">📦 View All Products</div>
            <div className="text-sm text-gray-500">Manage your product inventory</div>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}