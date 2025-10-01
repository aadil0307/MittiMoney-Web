import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    const configured = !!(accountSid && authToken && serviceSid)

    return NextResponse.json({
      configured,
      message: configured ? "Twilio is properly configured" : "Missing Twilio environment variables",
    })
  } catch (error) {
    return NextResponse.json({ configured: false, error: "Failed to check Twilio status" }, { status: 500 })
  }
}
