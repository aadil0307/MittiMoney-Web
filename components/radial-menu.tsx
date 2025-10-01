"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Mic, TreePine, Target, Users, FileText, X } from "lucide-react"

interface RadialMenuProps {
  onVoiceLogClick?: () => void
  onSavingsClick?: () => void
  onDebtsClick?: () => void
  onChitClick?: () => void
  onBillsClick?: () => void
}

export function RadialMenu({ onVoiceLogClick, onSavingsClick, onDebtsClick, onChitClick, onBillsClick }: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      icon: Target,
      label: "Savings",
      color: "bg-secondary",
      angle: 30, // Upper-right
      onClick: () => {
        onSavingsClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: TreePine,
      label: "Debt Tree",
      color: "bg-primary",
      angle: 65, // Upper center
      onClick: () => {
        onDebtsClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: Mic,
      label: "Voice Log",
      color: "bg-accent",
      angle: 100, // Upper-left
      onClick: () => {
        onVoiceLogClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: Users,
      label: "MittiCommit",
      color: "bg-accent",
      angle: 130, // Left
      onClick: () => {
        onChitClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: FileText,
      label: "Bills",
      color: "bg-muted-foreground/80",
      angle: 165, // Lower-left
      onClick: () => {
        onBillsClick?.()
        setIsOpen(false)
      },
    },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-6 right-32 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={toggleMenu}
            />

            {/* Menu Items */}
            {menuItems.map((item, index) => {
              const radius = 140
              const angleRad = (item.angle * Math.PI) / 180
              const x = Math.cos(angleRad) * radius
              const y = Math.sin(angleRad) * radius

              return (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    x: x,
                    y: -y,
                    transition: {
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                  exit={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    transition: { delay: (menuItems.length - index) * 0.03 },
                  }}
                  className="absolute bottom-0 right-0"
                >
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className={`w-16 h-16 rounded-full ${item.color} shadow-2xl border-2 border-white/20 backdrop-blur-sm hover:shadow-3xl transition-all duration-300`}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick()
                        } else {
                          console.log(`Clicked ${item.label}`)
                          setIsOpen(false)
                        }
                      }}
                    >
                      <item.icon className="w-7 h-7" />
                    </Button>
                  </motion.div>

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { delay: index * 0.05 + 0.1 },
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-card to-card/90 text-card-foreground px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl border border-border/50 backdrop-blur-sm"
                  >
                    {item.label}
                  </motion.div>
                </motion.div>
              )
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        <Button
          onClick={toggleMenu}
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-3xl relative z-10 border-4 border-white/20 transition-all duration-300"
        >
          <motion.div animate={{ rotate: isOpen ? 135 : 0 }} transition={{ duration: 0.3, type: "spring" }}>
            {isOpen ? <X className="w-9 h-9" /> : <Plus className="w-9 h-9" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}