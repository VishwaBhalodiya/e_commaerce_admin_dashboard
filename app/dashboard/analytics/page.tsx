import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
} from "lucide-react"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { StockChart } from "@/components/dashboard/stock-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"

async function getAnalyticsData() {
  // Get all products
  const products = await prisma.product.findMany({
    include: {
      sales: true,
    },
  })

  // Get all sales
  const sales = await prisma.sale.findMany({
    include: {
      product: true,
    },
    orderBy: {
      date: "asc",
    },
  })

  // Calculate totals
  const totalProducts = products.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0)
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const lowStockProducts = products.filter((p) => p.stock < 10).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  // Sales by month (for line chart)
  const salesByMonth: { [key: string]: number } = {}
  sales.forEach((sale) => {
    const month = new Date(sale.date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
    salesByMonth[month] = (salesByMonth[month] || 0) + sale.revenue
  })

  const monthlySalesData = Object.entries(salesByMonth).map(([month, revenue]) => ({
    month,
    revenue: Number(revenue.toFixed(2)),
  }))

  // Stock by category (for bar chart)
  const stockByCategory: { [key: string]: number } = {}
  products.forEach((product) => {
    stockByCategory[product.category] =
      (stockByCategory[product.category] || 0) + product.stock
  })

  const stockData = Object.entries(stockByCategory).map(([category, stock]) => ({
    category,
    stock,
  }))

  // Products by category (for pie chart)
  const productsByCategory: { [key: string]: number } = {}
  products.forEach((product) => {
    productsByCategory[product.category] =
      (productsByCategory[product.category] || 0) + 1
  })

  const categoryData = Object.entries(productsByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Top selling products
  const productSales: {
    [key: string]: { name: string; quantity: number; revenue: number; image: string }
  } = {}

  sales.forEach((sale) => {
    if (!productSales[sale.productId]) {
      productSales[sale.productId] = {
        name: sale.product.name,
        quantity: 0,
        revenue: 0,
        image: sale.product.images[0] || "",
      }
    }
    productSales[sale.productId].quantity += sale.quantity
    productSales[sale.productId].revenue += sale.revenue
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Low stock products list
  const lowStockList = products
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)

  return {
    totalProducts,
    totalRevenue,
    totalItemsSold,
    lowStockProducts,
    totalStock,
    monthlySalesData,
    stockData,
    categoryData,
    topProducts,
    lowStockList,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your store performance and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.totalStock} total units in stock
            </p>
          </CardContent>
        </Card>

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
              ${data.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {data.totalItemsSold} items sold
            </p>
          </CardContent>
        </Card>

        {/* Items Sold */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Items Sold
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalItemsSold}</div>
            <p className="text-xs text-gray-500 mt-1">Total units sold</p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Low Stock Alert
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.lowStockProducts > 0 ? "text-orange-500" : "text-green-500"}`}>
              {data.lowStockProducts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Products with less than 10 units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={data.monthlySalesData} />
          </CardContent>
        </Card>

        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Stock by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart data={data.stockData} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.categoryData} />
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-amber-600"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">
                      ${product.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No sales data yet</p>
                <p className="text-sm">Sales will appear here once recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products */}
      {data.lowStockList.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Products - Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.lowStockList.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200"
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-orange-600 font-semibold">
                      Only {product.stock} left!
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}