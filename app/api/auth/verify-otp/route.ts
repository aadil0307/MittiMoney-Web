import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

    console.log("[v0] Verify OTP - Environment variables check:", {
      accountSid: accountSid ? "✓ Set" : "✗ Missing",
      authToken: authToken ? "✓ Set" : "✗ Missing",
      serviceSid: serviceSid ? "✓ Set" : "✗ Missing",
    })

    if (!accountSid || !authToken || !serviceSid) {
      console.log("[v0] Missing Twilio environment variables for verification")
      return NextResponse.json(
        {
          error: "Twilio configuration is incomplete. Please check environment variables.",
          details: "Missing required Twilio credentials",
        },
        { status: 500 },
      )
    }

    const { phoneNumber, otp } = await request.json()
    console.log("[v0] Verify OTP request:", { phoneNumber, otpLength: otp?.length })

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 })
    }

    // Format phone number to E.164 format
    const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`
    console.log("[v0] Formatted phone number for verification:", formattedPhone)

    let client
    try {
      client = twilio(accountSid, authToken)
      console.log("[v0] Twilio client initialized for verification")
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

    // Verify OTP using Twilio Verify
    console.log("[v0] Attempting to verify OTP via Twilio...")
    const verificationCheck = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: formattedPhone,
      code: otp,
    })

    console.log("[v0] OTP verification result:", verificationCheck.status)

    if (verificationCheck.status === "approved") {
      // OTP verified successfully - now generate JWT tokens
      console.log("[v0] Generating JWT tokens for user:", formattedPhone)
      
      try {
        // Generate userId from phone number (you can modify this logic)
        const userId = formattedPhone.replace("+", "")
        
        // Generate JWT tokens
        const accessToken = await generateAccessToken({
          userId,
          phoneNumber: formattedPhone,
          role: "user",
        })

        const refreshToken = await generateRefreshToken({
          userId,
          phoneNumber: formattedPhone,
          role: "user",
        })

        // Set tokens in HTTP-only cookies
        await setAuthCookies(accessToken, refreshToken)

        console.log("[v0] JWT tokens generated and set in cookies for:", formattedPhone)

        return NextResponse.json({
          success: true,
          verified: true,
          message: "OTP verified successfully",
          userId,
        })
      } catch (jwtError: any) {
        console.error("[v0] JWT generation error:", jwtError)
        // Return success for OTP verification even if JWT fails
        return NextResponse.json({
          success: true,
          verified: true,
          message: "OTP verified successfully (JWT generation failed)",
          warning: "JWT tokens could not be generated",
        })
      }
    } else {
      return NextResponse.json(
        {
          error: "Invalid or expired OTP",
          verified: false,
          status: verificationCheck.status,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Twilio OTP verify error:", error)

    let errorMessage = "Failed to verify OTP"
    let statusCode = 500

    if (error.code) {
      switch (error.code) {
        case 20003:
          errorMessage = "Authentication failed - check Twilio credentials"
          break
        case 20404:
          errorMessage = "Verify service not found or verification expired"
          statusCode = 400
          break
        case 60200:
          errorMessage = "Invalid phone number format"
          statusCode = 400
          break
        case 60202:
          errorMessage = "Invalid verification code"
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
        verified: false,
      },
      { status: statusCode },
    )
  }
}
