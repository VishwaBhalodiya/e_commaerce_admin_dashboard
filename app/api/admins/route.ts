import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET all admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedCategories: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    )
  }
}

// POST new admin
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const invitedBy = session?.user?.name || "Admin"

    const body = await request.json()
    const { name, email, password, assignedCategories, sendEmail } = body

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (!assignedCategories || assignedCategories.length === 0) {
      return NextResponse.json(
        { error: "At least one category must be assigned" },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create admin (always role: "admin", never super-admin)
    const admin = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        assignedCategories: assignedCategories,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedCategories: true,
        createdAt: true,
      },
    })

    // Send welcome email if requested
    let emailSent = false
    let emailError = null

    if (sendEmail) {
      const emailResult = await sendWelcomeEmail({
        to: email.toLowerCase(),
        name,
        email: email.toLowerCase(),
        password,
        role: "admin",
        invitedBy,
      })

      emailSent = emailResult.success
      if (!emailResult.success) {
        emailError = emailResult.error
      }
    }

    return NextResponse.json(
      { 
        admin, 
        emailSent,
        emailError,
        message: emailSent 
          ? "Admin created and email sent!" 
          : "Admin created successfully"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    )
  }
}