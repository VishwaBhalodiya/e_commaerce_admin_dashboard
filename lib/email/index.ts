import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP Error:', error)
  } else {
    console.log('✅ Gmail SMTP Ready')
  }
})

interface SendWelcomeEmailProps {
  to: string
  name: string
  email: string
  password: string
  role: string
  invitedBy: string
}

interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

export async function sendWelcomeEmail({
  to,
  name,
  email,
  password,
  role,
  invitedBy,
}: SendWelcomeEmailProps): Promise<EmailResult> {
  
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const fromEmail = process.env.GMAIL_USER

  try {
    const info = await transporter.sendMail({
      from: `"Admin Dashboard" <${fromEmail}>`,
      to: to,
      subject: '🎉 Welcome to Admin Dashboard - Your Account is Ready!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛍️ Admin Dashboard</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your account has been created</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin: 0 0 20px;">Welcome, ${name}! 👋</h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        You have been invited by <strong>${invitedBy}</strong> to join as a 
                        <strong style="color: ${role === 'super-admin' ? '#8b5cf6' : '#3b82f6'};">
                          ${role === 'super-admin' ? 'Super Admin' : 'Admin'}
                        </strong>.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 30px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #1f2937; margin: 0 0 16px; font-size: 18px;">🔐 Your Login Credentials</h3>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background-color: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                                  <span style="display: block; font-size: 12px; color: #6b7280; text-transform: uppercase;">Email</span>
                                  <span style="display: block; font-size: 16px; color: #1f2937; font-weight: bold; font-family: monospace;">${email}</span>
                                </td>
                              </tr>
                              <tr><td style="height: 8px;"></td></tr>
                              <tr>
                                <td style="background-color: #ffffff; padding: 12px; border-radius: 6px;">
                                  <span style="display: block; font-size: 12px; color: #6b7280; text-transform: uppercase;">Password</span>
                                  <span style="display: block; font-size: 16px; color: #1f2937; font-weight: bold; font-family: monospace;">${password}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${appUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                              Login to Dashboard →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; margin-top: 20px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #92400e; font-size: 14px; margin: 0;">
                              <strong>⚠️ Security Notice:</strong><br>
                              Please change your password after first login. Do not share these credentials.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        This email was sent automatically. Please do not reply.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
                        © ${new Date().getFullYear()} Admin Dashboard. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error: any) {
    console.error('❌ Email error:', error)
    return { success: false, error: error.message }
  }
}

// Test email function
export async function sendTestEmail(to: string): Promise<EmailResult> {
  try {
    const info = await transporter.sendMail({
      from: `"Admin Dashboard" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: '✅ Test Email - Configuration Working!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">🎉 Email Test Successful!</h1>
          <p>Your Gmail SMTP configuration is working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is a test email from Admin Dashboard.</p>
        </div>
      `,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}