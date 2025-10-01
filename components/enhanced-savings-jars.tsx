"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Target, TrendingUp, Sparkles, Droplets } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { subscribeToUserSavingsJars, updateSavingsJar } from "@/lib/firebase/firestore"
import type { SavingsJar } from "@/lib/offline/indexeddb"

interface LiquidFillJarProps {
  jar: SavingsJar
  percentage: number
  onAddMoney: (amount: number) => void
}

function LiquidFillJar({ jar, percentage, onAddMoney }: LiquidFillJarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState("")

  // Calculate color based on progress
  const getColor = (percent: number) => {
    if (percent < 25) return { primary: "#ef4444", light: "#fca5a5", dark: "#dc2626" } // Red
    if (percent < 50) return { primary: "#f59e0b", light: "#fbbf24", dark: "#d97706" } // Orange
    if (percent < 75) return { primary: "#3b82f6", light: "#60a5fa", dark: "#2563eb" } // Blue
    if (percent < 100) return { primary: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" } // Purple
    return { primary: "#10b981", light: "#34d399", dark: "#059669" } // Green (completed)
  }

  const colors = getColor(percentage)
  const clampedPercentage = Math.min(percentage, 100)

  const handleAddMoney = () => {
    const numAmount = parseFloat(amount)
    if (numAmount > 0) {
      onAddMoney(numAmount)
      setAmount("")
      setShowAddMoney(false)
    }
  }

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-2 transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" style={{ color: colors.primary }} />
              {jar.name}
            </CardTitle>
            <motion.div
              animate={{ rotate: percentage >= 100 ? 360 : 0 }}
              transition={{ duration: 1, repeat: percentage >= 100 ? Infinity : 0, ease: "linear" }}
            >
              {percentage >= 100 ? (
                <Sparkles className="h-5 w-5 text-green-500" />
              ) : (
                <Droplets className="h-5 w-5" style={{ color: colors.primary }} />
              )}
            </motion.div>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Goal: ₹{jar.targetAmount.toLocaleString("en-IN")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Jar Container */}
          <div className="relative mb-4">
            {/* Jar SVG */}
            <svg
              viewBox="0 0 200 280"
              className="w-full h-auto"
              style={{ maxWidth: "200px", margin: "0 auto", display: "block" }}
            >
              {/* Jar outline */}
              <defs>
                <linearGradient id={`gradient-${jar.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: colors.light, stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: colors.dark, stopOpacity: 0.9 }} />
                </linearGradient>
                
                {/* Wave pattern */}
                <clipPath id={`jar-clip-${jar.id}`}>
                  <rect x="30" y="40" width="140" height="200" rx="5" />
                </clipPath>
              </defs>

              {/* Jar body */}
              <rect
                x="30"
                y="40"
                width="140"
                height="200"
                rx="5"
                fill="none"
                stroke={colors.primary}
                strokeWidth="3"
                opacity="0.3"
              />

              {/* Jar neck */}
              <rect x="60" y="20" width="80" height="25" rx="3" fill="none" stroke={colors.primary} strokeWidth="3" opacity="0.3" />
              
              {/* Jar lid */}
              <rect x="50" y="10" width="100" height="15" rx="5" fill={colors.primary} opacity="0.5" />

              {/* Liquid fill with wave animation */}
              <g clipPath={`url(#jar-clip-${jar.id})`}>
                <motion.g
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Main liquid */}
                  <motion.rect
                    x="30"
                    y={40 + (200 * (1 - clampedPercentage / 100))}
                    width="140"
                    height={200 * (clampedPercentage / 100)}
                    fill={`url(#gradient-${jar.id})`}
                    initial={{ height: 0, y: 240 }}
                    animate={{
                      height: 200 * (clampedPercentage / 100),
                      y: 40 + (200 * (1 - clampedPercentage / 100)),
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />

                  {/* Wave effect */}
                  <motion.path
                    d={`M 30 ${40 + (200 * (1 - clampedPercentage / 100))} 
                        Q 60 ${40 + (200 * (1 - clampedPercentage / 100)) - 5}, 
                          85 ${40 + (200 * (1 - clampedPercentage / 100))} 
                        T 140 ${40 + (200 * (1 - clampedPercentage / 100))} 
                        Q 155 ${40 + (200 * (1 - clampedPercentage / 100)) + 5}, 
                          170 ${40 + (200 * (1 - clampedPercentage / 100))} 
                        L 170 240 L 30 240 Z`}
                    fill={colors.primary}
                    opacity="0.6"
                    animate={{
                      d: [
                        `M 30 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         Q 60 ${40 + (200 * (1 - clampedPercentage / 100)) - 5}, 
                           85 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         T 140 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         Q 155 ${40 + (200 * (1 - clampedPercentage / 100)) + 5}, 
                           170 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         L 170 240 L 30 240 Z`,
                        `M 30 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         Q 60 ${40 + (200 * (1 - clampedPercentage / 100)) + 5}, 
                           85 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         T 140 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         Q 155 ${40 + (200 * (1 - clampedPercentage / 100)) - 5}, 
                           170 ${40 + (200 * (1 - clampedPercentage / 100))} 
                         L 170 240 L 30 240 Z`,
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Bubbles */}
                  {clampedPercentage > 0 && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.circle
                          key={i}
                          cx={50 + i * 40}
                          cy={240}
                          r="3"
                          fill="white"
                          opacity="0.5"
                          animate={{
                            cy: [240, 40 + (200 * (1 - clampedPercentage / 100))],
                            opacity: [0.5, 0],
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.7,
                          }}
                        />
                      ))}
                    </>
                  )}
                </motion.g>
              </g>

              {/* Percentage text */}
              <text
                x="100"
                y="150"
                textAnchor="middle"
                fill={clampedPercentage > 50 ? "white" : colors.primary}
                fontSize="32"
                fontWeight="bold"
              >
                {Math.round(clampedPercentage)}%
              </text>
            </svg>
          </div>

          {/* Progress info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saved</span>
              <span className="font-semibold">₹{jar.currentAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal</span>
              <span className="font-semibold">₹{jar.targetAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-semibold text-orange-600">
                ₹{(jar.targetAmount - jar.currentAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Add Money Button */}
          <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4" variant={percentage >= 100 ? "secondary" : "default"}>
                <Plus className="h-4 w-4 mr-2" />
                {percentage >= 100 ? "Goal Reached! 🎉" : "Add Money"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Money to {jar.name}</DialogTitle>
                <DialogDescription>
                  How much would you like to add to this savings jar?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                  />
                </div>
                <Button onClick={handleAddMoney} className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
                  Add ₹{amount || "0"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Celebration for completed jars */}
          <AnimatePresence>
            {percentage >= 100 && isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 1,
                    }}
                    animate={{
                      x: Math.cos((i / 10) * Math.PI * 2) * 100,
                      y: Math.sin((i / 10) * Math.PI * 2) * 100,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    {["🎉", "✨", "🌟", "💫", "⭐"][i % 5]}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface EnhancedSavingsJarsProps {
  userId: string
}

export function EnhancedSavingsJars({ userId }: EnhancedSavingsJarsProps) {
  const { language } = useLanguage()
  const [userJars, setUserJars] = useState<SavingsJar[]>([])

  useEffect(() => {
    // Subscribe to user's savings jars
    const unsubscribe = subscribeToUserSavingsJars(userId, (jars) => {
      setUserJars(jars)
    })

    return unsubscribe
  }, [userId])

  const handleAddMoney = async (jarId: string, amount: number) => {
    try {
      const jar = userJars.find((j) => j.id === jarId)
      if (!jar) return

      await updateSavingsJar(jarId, {
        currentAmount: jar.currentAmount + amount,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Error adding money to jar:", error)
    }
  }

  const translations = {
    hi: {
      title: "बचत के डिब्बे",
      description: "अपने लक्ष्यों के लिए बचत करें",
      noJars: "अभी तक कोई बचत डिब्बा नहीं बनाया गया",
      createJar: "नया डिब्बा बनाएं",
    },
    mr: {
      title: "बचतीचे डबे",
      description: "तुमच्या उद्दिष्टांसाठी बचत करा",
      noJars: "अजून कोणताही बचत डबा तयार केलेला नाही",
      createJar: "नवीन डबा तयार करा",
    },
    ta: {
      title: "சேமிப்பு ஜாடிகள்",
      description: "உங்கள் இலக்குகளுக்காக சேமிக்கவும்",
      noJars: "இன்னும் சேமிப்பு ஜாடி உருவாக்கப்படவில்லை",
      createJar: "புதிய ஜாடியை உருவாக்கவும்",
    },
    en: {
      title: "Savings Jars",
      description: "Save for your goals",
      noJars: "No savings jars created yet",
      createJar: "Create New Jar",
    },
  }

  const t = translations[language]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
      </div>

      {userJars.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{t.noJars}</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t.createJar}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userJars.map((jar) => {
            const percentage = (jar.currentAmount / jar.targetAmount) * 100
            return (
              <LiquidFillJar
                key={jar.id}
                jar={jar}
                percentage={percentage}
                onAddMoney={(amount) => handleAddMoney(jar.id, amount)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
