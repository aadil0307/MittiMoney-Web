"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Globe, ArrowRight } from "lucide-react"

interface LanguageSelectorProps {
  onLanguageSelect: (language: string) => void
}

const languages = [
  { code: "hi", name: "हिंदी", englishName: "Hindi", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", englishName: "Marathi", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", englishName: "Tamil", flag: "🇮🇳" },
  { code: "en", name: "English", englishName: "English", flag: "🇬🇧" },
]

export function LanguageSelector({ onLanguageSelect }: LanguageSelectorProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
          >
            <Globe className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Language
          </h2>
        </div>
        <p className="text-lg text-muted-foreground">अपनी भाषा चुनें / Select your preferred language</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((language, index) => (
          <motion.div
            key={language.code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3, type: "spring" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/90 dark:bg-card/90 backdrop-blur-sm overflow-hidden group"
              onClick={() => onLanguageSelect(language.code)}
            >
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {language.flag}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-foreground">{language.name}</div>
                    <div className="text-sm text-muted-foreground">{language.englishName}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Welcome
        </Button>
      </motion.div>
    </div>
  )
}
