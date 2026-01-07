import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// GET all sales (filtered by role)
export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user with role and assigned categories
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const isSuperAdmin = currentUser.role === "super-admin"

    let sales

    if (isSuperAdmin) {
      // Super Admin: See all sales
      sales = await prisma.sale.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })
    } else {
      // Regular Admin: See only sales from assigned categories
      const assignedCategories = currentUser.assignedCategories || []

      if (assignedCategories.length === 0) {
        // No assigned categories = no sales to show
        return NextResponse.json({ sales: [] })
      }

      sales = await prisma.sale.findMany({
        where: {
          product: {
            category: {
              in: assignedCategories,
            },
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })
    }

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    )
  }
}

// POST new sale (only for assigned categories for regular admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = body

    // Validate input
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Product and quantity are required" },
        { status: 400 }
      )
    }

    // Get product to calculate revenue and check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if regular admin has access to this product's category
    const isSuperAdmin = currentUser.role === "super-admin"
    
    if (!isSuperAdmin) {
      const assignedCategories = currentUser.assignedCategories || []
      
      if (!product.category || !assignedCategories.includes(product.category)) {
        return NextResponse.json(
          { error: "You don't have permission to sell products from this category" },
          { status: 403 }
        )
      }
    }

    // Check if enough stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Not enough stock. Available: ${product.stock}` },
        { status: 400 }
      )
    }

    // Calculate revenue
    const revenue = product.price * quantity

    // Create sale and update stock in a transaction
    const [sale] = await prisma.$transaction([
      // Create sale
      prisma.sale.create({
        data: {
          productId,
          quantity,
          revenue,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: true,
            },
          },
        },
      }),
      // Reduce stock
      prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      }),
    ])

    return NextResponse.json({ sale }, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    )
  }
}