import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Create default settings if not exists
    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        companyName: "My E-Commerce Store",
        lowStockThreshold: 10,
        currency: "USD",
      },
    })

    return NextResponse.json({ 
      message: "Settings initialized", 
      settings 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}