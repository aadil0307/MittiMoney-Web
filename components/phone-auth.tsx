"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Shield, ArrowRight, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface PhoneAuthProps {
  onAuthSuccess: () => void
}

const languageTexts = {
  hi: {
    title: "फ़ोन नंबर दर्ज करें",
    subtitle: "सीधे लॉगिन करें",
    placeholder: "अपना फ़ोन नंबर दर्ज करें",
    login: "लॉगिन करें",
    secure: "आपकी जानकारी सुरक्षित है",
    logging: "लॉगिन हो रहा है...",
    error: "कृपया वैध फ़ोन नंबर दर्ज करें",
  },
  mr: {
    title: "फोन नंबर टाका",
    subtitle: "थेट लॉगिन करा",
    placeholder: "तुमचा फोन नंबर टाका",
    login: "लॉगिन करा",
    secure: "तुमची माहिती सुरक्षित आहे",
    logging: "लॉगिन होत आहे...",
    error: "कृपया वैध फोन नंबर टाका",
  },
  ta: {
    title: "தொலைபேசி எண்ணை உள்ளிடவும்",
    subtitle: "நேரடியாக உள்நுழையவும்",
    placeholder: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",
    login: "உள்நுழையவும்",
    secure: "உங்கள் தகவல் பாதுகாப்பானது",
    logging: "உள்நுழைகிறது...",
    error: "சரியான தொலைபேசி எண்ணை உள்ளிடவும்",
  },
  en: {
    title: "Enter Phone Number",
    subtitle: "Login directly",
    placeholder: "Enter your phone number",
    login: "Login",
    secure: "Your information is secure",
    logging: "Logging in...",
    error: "Please enter a valid phone number",
  },
}

export function PhoneAuth({ onAuthSuccess }: PhoneAuthProps) {
  const { language } = useLanguage()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const texts = languageTexts[language as keyof typeof languageTexts] || languageTexts.en

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      setError(texts.error)
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate a brief loading period for better UX
    setTimeout(() => {
      console.log("[v0] Direct login successful for phone:", phoneNumber)
      onAuthSuccess()
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Phone className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {texts.title}
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">{texts.subtitle}</p>
      </motion.div>

      <Card className="border-0 shadow-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-lg">{texts.secure}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder={texts.placeholder}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  if (error) setError("")
                }}
                className="text-xl p-7 text-center border-2 focus:border-primary rounded-xl shadow-sm"
                maxLength={10}
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleLogin}
                disabled={phoneNumber.length < 10 || isLoading}
                className="w-full text-lg p-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl shadow-xl"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>{texts.logging}</span>
                  </div>
                ) : (
                  <>
                    {texts.login}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
