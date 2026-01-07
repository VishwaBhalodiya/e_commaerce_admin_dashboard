import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE admin
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      )
    }

    // Prevent deleting super-admin
    if (admin.role === "super-admin") {
      return NextResponse.json(
        { error: "Cannot delete super admin" },
        { status: 403 }
      )
    }

    // Delete admin
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Admin deleted successfully" })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    )
  }
}