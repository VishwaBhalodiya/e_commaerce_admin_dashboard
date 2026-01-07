import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { verifyPassword, hashPassword } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify current password using your auth utility
    const isValidPassword = await verifyPassword(currentPassword, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password using your auth utility
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      message: "Password updated successfully"
    })
  } catch (error: any) {
    console.error("Password update error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update password" },
      { status: 500 }
    )
  }
}