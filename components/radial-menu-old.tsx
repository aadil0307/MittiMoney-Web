"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Mic, TreePine, Target, Users, Settings, X } from "lucide-react"

interface RadialMenuProps {
  onVoiceLogClick?: () => void
  onSavingsClick?: () => void
  onDebtsClick?: () => void
  onChitClick?: () => void
}

export function RadialMenu({ onVoiceLogClick, onSavingsClick, onDebtsClick, onChitClick }: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      icon: Mic,
      label: "Voice Log",
      color: "bg-accent",
      angle: 0,
      onClick: () => {
        onVoiceLogClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: TreePine,
      label: "Debt Tree",
      color: "bg-primary",
      angle: 60,
      onClick: () => {
        onDebtsClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: Target,
      label: "Savings",
      color: "bg-secondary",
      angle: 120,
      onClick: () => {
        onSavingsClick?.()
        setIsOpen(false)
      },
    },
    {
      icon: Users,
      label: "MittiCommit",
      color: "bg-accent",
      angle: 180,
      onClick: () => {
        onChitClick?.()
        setIsOpen(false)
      },
    },
    { icon: Settings, label: "Settings", color: "bg-muted", angle: 240 },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-6 right-6 z-50">
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
              const radius = 80
              const angleRad = (item.angle * Math.PI) / 180
              const x = Math.cos(angleRad) * radius
              const y = Math.sin(angleRad) * radius

              return (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    x: -x,
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
                  <Button
                    size="lg"
                    className={`w-14 h-14 rounded-full ${item.color} hover:scale-110 transition-transform shadow-lg`}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick()
                      } else {
                        console.log(`Clicked ${item.label}`)
                        setIsOpen(false)
                      }
                    }}
                  >
                    <item.icon className="w-6 h-6" />
                  </Button>

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { delay: index * 0.05 + 0.1 },
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card text-card-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-md"
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
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={toggleMenu}
          size="lg"
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-xl relative z-10"
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}
