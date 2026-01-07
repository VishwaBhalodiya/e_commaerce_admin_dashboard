import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE sale
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get sale to restore stock
    const sale = await prisma.sale.findUnique({
      where: { id },
    })

    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      )
    }

    // Delete sale and restore stock in a transaction
    await prisma.$transaction([
      // Delete sale
      prisma.sale.delete({
        where: { id },
      }),
      // Restore stock
      prisma.product.update({
        where: { id: sale.productId },
        data: {
          stock: {
            increment: sale.quantity,
          },
        },
      }),
    ])

    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    )
  }
}