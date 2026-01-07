import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET products (filtered by user's assigned categories)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with assigned categories
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, assignedCategories: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build where clause based on role
    let whereClause = {}
    
    if (user.role !== "super-admin") {
      // Regular admin - only show assigned categories
      if (user.assignedCategories && user.assignedCategories.length > 0) {
        whereClause = {
          category: {
            in: user.assignedCategories
          }
        }
      } else {
        // No categories assigned - show nothing
        return NextResponse.json({ products: [] })
      }
    }
    // Super admin - show all products (empty whereClause)

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with assigned categories
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, assignedCategories: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, stock, category, images } = body

    // Check if regular admin can create product in this category
    if (user.role !== "super-admin") {
      if (!user.assignedCategories || !user.assignedCategories.includes(category)) {
        return NextResponse.json(
          { error: `You don't have permission to add products in ${category} category` },
          { status: 403 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        images: images || [],
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}