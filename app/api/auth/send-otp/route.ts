import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    console.log("[v0] Environment variables check:", {
      accountSid: accountSid ? "✓ Set" : "✗ Missing",
      authToken: authToken ? "✓ Set" : "✗ Missing",
      serviceSid: serviceSid ? "✓ Set" : "✗ Missing",
    })

    if (!accountSid || !authToken || !serviceSid) {
      console.log("[v0] Missing Twilio environment variables")
      return NextResponse.json(
        {
          error: "Twilio configuration is incomplete. Please check environment variables.",
          details: "Missing required Twilio credentials",
        },
        { status: 500 },
      )
    }

    const { phoneNumber } = await request.json()
    console.log("[v0] Received phone number:", phoneNumber)

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Format phone number to E.164 format
    const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`
    console.log("[v0] Formatted phone number:", formattedPhone)

    let client
    try {
      client = twilio(accountSid, authToken)
      console.log("[v0] Twilio client initialized successfully")
    } catch (clientError: any) {
      console.error("[v0] Twilio client initialization error:", clientError)
      return NextResponse.json(
        {
          error: "Failed to initialize Twilio client",
          details: clientError.message,
        },
        { status: 500 },
      )
    }

    // Send OTP using Twilio Verify
    console.log("[v0] Attempting to send OTP via Twilio...")
    const verification = await client.verify.v2.services(serviceSid).verifications.create({
      to: formattedPhone,
      channel: "sms",
    })

    console.log("[v0] OTP sent successfully:", verification.status)
    return NextResponse.json({
      success: true,
      status: verification.status,
      message: "OTP sent successfully",
    })
  } catch (error: any) {
    console.error("[v0] Twilio OTP send error:", error)

    let errorMessage = "Failed to send OTP"
    let statusCode = 500

    if (error.code) {
      switch (error.code) {
        case 20003:
          errorMessage = "Authentication failed - check Twilio credentials"
          break
        case 20404:
          errorMessage = "Verify service not found - check TWILIO_VERIFY_SERVICE_SID"
          break
        case 60200:
          errorMessage = "Invalid phone number format"
          statusCode = 400
          break
        case 60203:
          errorMessage = "Phone number is not a valid mobile number"
          statusCode = 400
          break
        default:
          errorMessage = `Twilio error: ${error.message}`
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code,
      },
      { status: statusCode },
    )
  }
}
