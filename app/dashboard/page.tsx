import { prisma } from "@/lib/prisma"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

async function getDashboardStats() {
  const [totalProducts, totalSales, lowStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.sale.aggregate({
      _sum: { revenue: true }
    }),
    prisma.product.count({
      where: { stock: { lte: 10 } }
    })
  ])

  // Get unique categories from products
  const products = await prisma.product.findMany({
    select: { category: true }
  })
  
  // Count products per category
  const categoryMap = new Map<string, number>()
  products.forEach(p => {
    const cat = p.category || "Uncategorized"
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  })
  
  const categoryStats = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count
  }))

  // Stock distribution
  const inStock = await prisma.product.count({
    where: { stock: { gt: 10 } }
  })
  const outOfStock = await prisma.product.count({
    where: { stock: { equals: 0 } }
  })

  // Recent products
  const recentProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  })

  return {
    totalProducts,
    totalRevenue: totalSales._sum.revenue || 0,
    lowStockCount,
    totalCategories: categoryMap.size,
    categoryStats,
    stockStats: {
      inStock,
      lowStock: lowStockCount,
      outOfStock
    },
    recentProducts: JSON.parse(JSON.stringify(recentProducts))
  }
}

export default async function DashboardPage() {
  const initialData = await getDashboardStats()
  return <DashboardClient initialData={initialData} />
}