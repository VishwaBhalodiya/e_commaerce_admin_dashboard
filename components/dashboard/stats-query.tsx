"use client"

import { useDashboardStats } from "@/hooks/use-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  FolderOpen, 
  AlertTriangle, 
  Star,
  DollarSign,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardStatsQuery() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      title: "Total Products",
      value: data?.totalProducts || 0,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Categories",
      value: data?.totalCategories || 0,
      icon: FolderOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Low Stock",
      value: data?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      title: "Featured",
      value: data?.featuredProducts || 0,
      icon: Star,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}