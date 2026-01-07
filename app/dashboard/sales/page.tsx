"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesTable } from "@/components/sales/sales-table"
import { AddSaleModal } from "@/components/sales/add-sale-modal"
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

interface Sale {
  id: string
  productId: string
  quantity: number
  revenue: number
  date: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales")
      const data = await response.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error("Failed to fetch sales:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const handleSaleAdded = () => {
    fetchSales()
  }

  const handleSaleDeleted = (id: string) => {
    setSales((prev) => prev.filter((sale) => sale.id !== id))
  }

  // Calculate totals
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0)
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const totalSales = sales.length

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading sales...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage and track your sales</p>
        </div>
        <AddSaleModal onSaleAdded={handleSaleAdded} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Items Sold */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Items Sold
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItemsSold}</div>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Transactions
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales} onDelete={handleSaleDeleted} />
        </CardContent>
      </Card>
    </div>
  )
}