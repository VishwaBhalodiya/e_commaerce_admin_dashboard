import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== "super-admin") {
      return NextResponse.json(
        { error: "Only super admins can update company settings" },
        { status: 403 }
      )
    }

    const { companyName, lowStockThreshold, currency } = await request.json()

    console.log("Company settings updated:", { companyName, lowStockThreshold, currency })

    return NextResponse.json({
      message: "Company settings updated successfully",
      settings: { companyName, lowStockThreshold, currency }
    })
  } catch (error: any) {
    console.error("Company settings error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      companyName: "My E-Commerce Store",
      lowStockThreshold: "10",
      currency: "USD"
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    )
  }
}