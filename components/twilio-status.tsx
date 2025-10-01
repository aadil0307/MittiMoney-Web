"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function TwilioStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkTwilioStatus()
  }, [])

  const checkTwilioStatus = async () => {
    try {
      const response = await fetch("/api/auth/twilio-status")
      const data = await response.json()

      if (data.configured) {
        setStatus("connected")
      } else {
        setStatus("error")
        setError("Twilio not configured")
      }
    } catch (error) {
      setStatus("error")
      setError("Failed to check Twilio status")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking..."
      case "connected":
        return "Connected"
      case "error":
        return error || "Error"
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "checking":
        return "secondary"
      case "connected":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Twilio Integration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
        </div>
        {status === "error" && (
          <p className="text-sm text-muted-foreground mt-2">
            Please check your Twilio configuration in environment variables.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
