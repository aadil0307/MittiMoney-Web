"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Globe, Users, Coins, TreePine, Target } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { PhoneAuth } from "@/components/phone-auth"
import { PhoneLogin } from "@/components/phone-login"
import { PhoneAuthEnhanced } from "@/components/phone-auth-enhanced"
import { Dashboard } from "@/components/dashboard"
import { UserOnboarding } from "@/components/user-onboarding"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { language, setLanguage } = useLanguage()
  const { isAuthenticated, loading: authLoading, user, needsOnboarding } = useAuth()
  const [currentStep, setCurrentStep] = useState<"welcome" | "language" | "auth" | "onboarding" | "dashboard">("language")
  const [languageSelected, setLanguageSelected] = useState(false)

  // Check auth status and update step accordingly
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        if (needsOnboarding) {
          setCurrentStep("onboarding")
        } else {
          setCurrentStep("dashboard")
        }
      } else if (currentStep === "dashboard" || currentStep === "onboarding") {
        // If user was on dashboard/onboarding but logged out, go back to language
        setCurrentStep("language")
        setLanguageSelected(false)
      }
    }
  }, [isAuthenticated, authLoading, user, needsOnboarding])

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as "hi" | "mr" | "ta" | "en")
    setLanguageSelected(true)
    setCurrentStep("auth")
  }

  const handleAuthSuccess = () => {
    // Auth context will automatically trigger needsOnboarding check
    // This will be handled by the useEffect above
  }

  const handleOnboardingComplete = () => {
    setCurrentStep("dashboard")
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading MittiMoney...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: Mic,
      title: "Voice-First Logging",
      description: "Speak your transactions naturally in your language",
    },
    {
      icon: TreePine,
      title: "Debt Tree",
      description: "Visualize and manage your debts like branches on a tree",
    },
    {
      icon: Target,
      title: "Savings Jars",
      description: "Gamified micro-savings for your goals",
    },
    {
      icon: Users,
      title: "MittiCommit",
      description: "Digital chit funds with blockchain transparency",
    },
  ]

  if (currentStep === "onboarding") {
    return <UserOnboarding onComplete={handleOnboardingComplete} />
  }

  if (currentStep === "dashboard") {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-muted/30 dark:to-secondary/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-12 max-w-6xl mx-auto"
            >
              {/* Logo and Header */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30"
                  >
                    <Coins className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    MittiMoney
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto font-medium leading-relaxed">
                  Your trusted financial companion for building a{" "}
                  <span className="text-primary font-semibold">secure future</span>, one rupee at a time
                </p>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5, type: "spring" }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                      <CardContent className="p-8 text-center space-y-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                        >
                          <feature.icon className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button - Hidden since we start with language selection */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setCurrentStep("language")}
                    size="lg"
                    className="text-lg px-12 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl font-semibold"
                  >
                    <Globe className="w-6 h-6 mr-3" />
                    शुरू करें / Get Started
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {currentStep === "language" && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <LanguageSelector onLanguageSelect={handleLanguageSelect} />
            </motion.div>
          )}

          {currentStep === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <PhoneAuthEnhanced onLoginSuccess={handleAuthSuccess} language={language} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
