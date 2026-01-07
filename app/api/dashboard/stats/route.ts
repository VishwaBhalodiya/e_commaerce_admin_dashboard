import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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

    return NextResponse.json({
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
      recentProducts
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    )
  }
}