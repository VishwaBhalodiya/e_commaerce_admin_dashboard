import { NextResponse } from "next/server"
import { sendTestEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const result = await sendTestEmail(email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}