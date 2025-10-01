"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Plus,
  IndianRupee,
  Trophy,
  Flame,
  Star,
  Gift,
  Home,
  Car,
  Smartphone,
  GraduationCap,
  Heart,
  Plane,
  Edit,
  Trash2,
} from "lucide-react"
import { useOffline } from "./offline-manager"
import { useOfflineStorage } from "@/hooks/use-local-storage"

interface SavingsJar {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  icon: string
  color: string
  streak: number
  badges: string[]
  createdAt: Date
  targetDate?: Date
}

interface SavingsJarsProps {
  selectedLanguage: string
  onBack: () => void
}

const jarIcons = {
  home: Home,
  car: Car,
  phone: Smartphone,
  education: GraduationCap,
  medical: Heart,
  travel: Plane,
  gift: Gift,
  target: Target,
}

const jarColors = [
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
  "bg-gradient-to-br from-red-400 to-red-600",
]

const languageTexts = {
  hi: {
    title: "बचत के जार",
    subtitle: "अपने सपनों के लिए बचत करें",
    createNew: "नया जार बनाएं",
    jarName: "जार का नाम",
    targetAmount: "लक्ष्य राशि",
    addMoney: "पैसे जोड़ें",
    amount: "राशि",
    add: "जोड़ें",
    edit: "संपादित करें",
    delete: "हटाएं",
    streak: "लगातार दिन",
    progress: "प्रगति",
    achieved: "पूरा हुआ",
    badges: "बैज",
    create: "बनाएं",
    cancel: "रद्द करें",
    congratulations: "बधाई हो!",
    goalAchieved: "लक्ष्य पूरा हुआ!",
    streakBadge: "स्ट्रीक चैंपियन",
    saverBadge: "महान बचतकर्ता",
    quickSaver: "तेज़ बचतकर्ता",
  },
  en: {
    title: "Savings Jars",
    subtitle: "Save for your dreams",
    createNew: "Create New Jar",
    jarName: "Jar Name",
    targetAmount: "Target Amount",
    addMoney: "Add Money",
    amount: "Amount",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    streak: "Day Streak",
    progress: "Progress",
    achieved: "Achieved",
    badges: "Badges",
    create: "Create",
    cancel: "Cancel",
    congratulations: "Congratulations!",
    goalAchieved: "Goal Achieved!",
    streakBadge: "Streak Champion",
    saverBadge: "Super Saver",
    quickSaver: "Quick Saver",
  },
  mr: {
    title: "बचतीचे भांडे",
    subtitle: "तुमच्या स्वप्नांसाठी बचत करा",
    createNew: "नवीन भांडे तयार करा",
    jarName: "भांड्याचे नाव",
    targetAmount: "लक्ष्य रक्कम",
    addMoney: "पैसे घाला",
    amount: "रक्कम",
    add: "घाला",
    edit: "संपादित करा",
    delete: "काढून टाका",
    streak: "सलग दिवस",
    progress: "प्रगती",
    achieved: "पूर्ण झाले",
    badges: "बॅज",
    create: "तयार करा",
    cancel: "रद्द करा",
    congratulations: "अभिनंदन!",
    goalAchieved: "लक्ष्य पूर्ण झाले!",
    streakBadge: "स्ट्रीक चॅम्पियन",
    saverBadge: "उत्तम बचतकर्ता",
    quickSaver: "जलद बचतकर्ता",
  },
  ta: {
    title: "சேமிப்பு ஜாடிகள்",
    subtitle: "உங்கள் கனவுகளுக்காக சேமிக்கவும்",
    createNew: "புதிய ஜாடி உருவாக்கவும்",
    jarName: "ஜாடியின் பெயர்",
    targetAmount: "இலக்கு தொகை",
    addMoney: "பணம் சேர்க்கவும்",
    amount: "தொகை",
    add: "சேர்க்கவும்",
    edit: "திருத்தவும்",
    delete: "நீக்கவும்",
    streak: "தொடர் நாட்கள்",
    progress: "முன்னேற்றம்",
    achieved: "அடைந்தது",
    badges: "பேட்ஜ்கள்",
    create: "உருவாக்கவும்",
    cancel: "ரத்து செய்",
    congratulations: "வாழ்த்துக்கள்!",
    goalAchieved: "இலக்கு அடைந்தது!",
    streakBadge: "ஸ்ட்ரீக் சாம்பியன்",
    saverBadge: "சூப்பர் சேவர்",
    quickSaver: "விரைவு சேவர்",
  },
}

export function SavingsJars({ selectedLanguage, onBack }: SavingsJarsProps) {
  const { isOnline, addPendingSaving } = useOffline()
  const { savings, setSavings } = useOfflineStorage()

  const [jars, setJars] = useState<SavingsJar[]>([
    {
      id: "1",
      name: "New Phone",
      targetAmount: 25000,
      currentAmount: 8500,
      icon: "phone",
      color: jarColors[1],
      streak: 12,
      badges: ["quickSaver"],
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 32000,
      icon: "medical",
      color: jarColors[4],
      streak: 25,
      badges: ["streakBadge", "saverBadge"],
      createdAt: new Date(),
    },
  ])

  useEffect(() => {
    if (savings && savings.length > 0) {
      setJars(savings)
    }
  }, [savings])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState<string | null>(null)
  const [newJar, setNewJar] = useState({
    name: "",
    targetAmount: "",
    icon: "target",
    color: jarColors[0],
  })
  const [addAmount, setAddAmount] = useState("")
  const [celebratingJar, setCelebratingJar] = useState<string | null>(null)

  const texts = languageTexts[selectedLanguage as keyof typeof languageTexts] || languageTexts.en

  const createJar = () => {
    if (newJar.name && newJar.targetAmount) {
      const jar: SavingsJar = {
        id: Date.now().toString(),
        name: newJar.name,
        targetAmount: Number.parseFloat(newJar.targetAmount),
        currentAmount: 0,
        icon: newJar.icon,
        color: newJar.color,
        streak: 0,
        badges: [],
        createdAt: new Date(),
      }
      const updatedJars = [...jars, jar]
      setJars(updatedJars)
      setSavings(updatedJars)

      if (!isOnline) {
        addPendingSaving({ action: "create", jar })
      }

      setNewJar({ name: "", targetAmount: "", icon: "target", color: jarColors[0] })
      setShowCreateForm(false)
    }
  }

  const addMoneyToJar = (jarId: string) => {
    if (!addAmount) return

    const amount = Number.parseFloat(addAmount)
    const updatedJars = jars.map((jar) => {
      if (jar.id === jarId) {
        const newAmount = jar.currentAmount + amount
        const updatedJar = {
          ...jar,
          currentAmount: newAmount,
          streak: jar.streak + 1,
        }

        if (newAmount >= jar.targetAmount && jar.currentAmount < jar.targetAmount) {
          setCelebratingJar(jarId)
          setTimeout(() => setCelebratingJar(null), 3000)
        }

        if (updatedJar.streak >= 7 && !updatedJar.badges.includes("streakBadge")) {
          updatedJar.badges.push("streakBadge")
        }
        if (updatedJar.currentAmount >= updatedJar.targetAmount * 0.5 && !updatedJar.badges.includes("saverBadge")) {
          updatedJar.badges.push("saverBadge")
        }

        return updatedJar
      }
      return jar
    })

    setJars(updatedJars)
    setSavings(updatedJars)

    if (!isOnline) {
      addPendingSaving({ action: "add_money", jarId, amount })
    }

    setAddAmount("")
    setShowAddMoney(null)
  }

  const getProgressPercentage = (jar: SavingsJar) => {
    return Math.min((jar.currentAmount / jar.targetAmount) * 100, 100)
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "streakBadge":
        return <Flame className="w-4 h-4" />
      case "saverBadge":
        return <Star className="w-4 h-4" />
      case "quickSaver":
        return <Trophy className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "streakBadge":
        return "bg-orange-100 text-orange-800"
      case "saverBadge":
        return "bg-yellow-100 text-yellow-800"
      case "quickSaver":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline">
            ← Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">{texts.title}</h1>
            <p className="text-muted-foreground">{texts.subtitle}</p>
            {!isOnline && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 mt-2">
                ऑफलाइन मोड - डेटा स्थानीय रूप से सहेजा जा रहा है
              </Badge>
            )}
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            {texts.createNew}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jars.map((jar, index) => {
            const IconComponent = jarIcons[jar.icon as keyof typeof jarIcons]
            const progress = getProgressPercentage(jar)
            const isCompleted = jar.currentAmount >= jar.targetAmount

            return (
              <motion.div
                key={jar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="overflow-hidden border-2 border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-full ${jar.color} flex items-center justify-center text-white shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{jar.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-muted-foreground">
                              {jar.streak} {texts.streak}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <Trophy className="w-3 h-3 mr-1" />
                          {texts.achieved}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{texts.progress}</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {jar.currentAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <span>/</span>
                          <IndianRupee className="w-4 h-4" />
                          <span>{jar.targetAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    {jar.badges.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{texts.badges}:</p>
                        <div className="flex flex-wrap gap-2">
                          {jar.badges.map((badge, badgeIndex) => (
                            <Badge key={badgeIndex} className={getBadgeColor(badge)}>
                              {getBadgeIcon(badge)}
                              <span className="ml-1 text-xs">
                                {badge === "streakBadge"
                                  ? texts.streakBadge
                                  : badge === "saverBadge"
                                    ? texts.saverBadge
                                    : texts.quickSaver}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button onClick={() => setShowAddMoney(jar.id)} className="flex-1" disabled={isCompleted}>
                        <Plus className="w-4 h-4 mr-2" />
                        {texts.addMoney}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {celebratingJar === jar.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-br from-yellow-400/90 to-orange-500/90 rounded-lg flex items-center justify-center text-white text-center p-6"
                    >
                      <div className="space-y-3">
                        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1, repeat: 2 }}>
                          <Trophy className="w-16 h-16 mx-auto" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold">{texts.congratulations}</h3>
                          <p className="text-sm">{texts.goalAchieved}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 w-full max-w-md space-y-4"
              >
                <h3 className="text-xl font-bold text-center">{texts.createNew}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.jarName}</label>
                    <Input
                      value={newJar.name}
                      onChange={(e) => setNewJar({ ...newJar, name: e.target.value })}
                      placeholder="e.g., New Phone, Emergency Fund"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{texts.targetAmount}</label>
                    <Input
                      type="number"
                      value={newJar.targetAmount}
                      onChange={(e) => setNewJar({ ...newJar, targetAmount: e.target.value })}
                      placeholder="25000"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {Object.entries(jarIcons).map(([key, IconComponent]) => (
                        <Button
                          key={key}
                          variant={newJar.icon === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewJar({ ...newJar, icon: key })}
                          className="aspect-square"
                        >
                          <IconComponent className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {jarColors.map((color, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewJar({ ...newJar, color })}
                          className={`aspect-square ${color} ${newJar.color === color ? "ring-2 ring-primary" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={createJar} className="flex-1">
                    {texts.create}
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddMoney && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg p-6 w-full max-w-sm space-y-4"
              >
                <h3 className="text-xl font-bold text-center">{texts.addMoney}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{texts.amount}</label>
                    <Input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="100"
                      className="text-center text-lg"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={() => addMoneyToJar(showAddMoney)} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {texts.add}
                  </Button>
                  <Button onClick={() => setShowAddMoney(null)} variant="outline" className="flex-1">
                    {texts.cancel}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
