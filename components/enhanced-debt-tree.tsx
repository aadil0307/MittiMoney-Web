"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TreePine, TrendingDown, CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { subscribeToUserDebts, updateDebt } from "@/lib/firebase/firestore"
import type { Debt } from "@/lib/offline/indexeddb"

interface DebtNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  amount: number
  paid: number
  percentage: number
  level: number
}

interface DebtLink extends d3.SimulationLinkDatum<DebtNode> {
  source: DebtNode
  target: DebtNode
}

interface EnhancedDebtTreeProps {
  userId: string
}

export function EnhancedDebtTree({ userId }: EnhancedDebtTreeProps) {
  const { language } = useLanguage()
  const svgRef = useRef<SVGSVGElement>(null)
  const [debts, setDebts] = useState<Debt[]>([])
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Subscribe to user debts
  useEffect(() => {
    const unsubscribe = subscribeToUserDebts(userId, (userDebts) => {
      setDebts(userDebts)
    })

    return unsubscribe
  }, [userId])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: Math.max(600, container.clientHeight),
          })
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Create tree visualization
  useEffect(() => {
    if (!svgRef.current || debts.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Create root node (trunk)
    const rootNode: DebtNode = {
      id: "root",
      name: "You",
      amount: 0,
      paid: 0,
      percentage: 0,
      level: 0,
      x: centerX,
      y: height - 50,
      fx: centerX,
      fy: height - 50,
    }

    // Convert debts to nodes
    const debtNodes: DebtNode[] = debts.map((debt, index) => {
      const paid = debt.totalAmount - debt.remainingAmount
      const percentage = (paid / debt.totalAmount) * 100
      return {
        id: debt.id,
        name: debt.lenderName || debt.name,
        amount: debt.totalAmount,
        paid,
        percentage,
        level: 1,
        x: centerX + (Math.random() - 0.5) * 400,
        y: centerY - 100 + (Math.random() - 0.5) * 200,
      }
    })

    const nodes = [rootNode, ...debtNodes]

    // Create links from root to all debt nodes
    const links: DebtLink[] = debtNodes.map((node) => ({
      source: rootNode,
      target: node,
    }))

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<DebtNode, DebtLink>(links)
          .id((d) => d.id)
          .distance(150)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collision", d3.forceCollide().radius(60))
      .force(
        "radial",
        d3
          .forceRadial(
            (d: DebtNode) => (d.level === 0 ? 0 : 200),
            centerX,
            centerY - 50
          )
          .strength(0.8)
      )
      .force("center", d3.forceCenter(centerX, centerY - 50))

    // Create container group
    const g = svg
      .append("g")
      .attr("class", "tree-container")

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Draw links (branches)
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 8)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0.6)

    // Draw nodes (debt circles)
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", (d) => (d.level === 0 ? "default" : "pointer"))
      .call(
        d3
          .drag<SVGGElement, DebtNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            if (d.level !== 0) {
              d.fx = null
              d.fy = null
            }
          }) as any
      )
      .on("click", (event, d) => {
        if (d.level !== 0) {
          const debt = debts.find((debt) => debt.id === d.id)
          if (debt) setSelectedDebt(debt)
        }
      })

    // Root node (trunk) - brown rectangle
    node
      .filter((d) => d.level === 0)
      .append("rect")
      .attr("width", 40)
      .attr("height", 80)
      .attr("x", -20)
      .attr("y", -40)
      .attr("rx", 5)
      .attr("fill", "#8b4513")
      .attr("stroke", "#654321")
      .attr("stroke-width", 2)

    // Debt nodes - circles with gradient
    const debtNodeGroups = node.filter((d) => d.level !== 0)

    // Add glow filter
    const defs = svg.append("defs")

    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur")

    const feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Add gradients for each debt node
    debtNodeGroups.each(function (d) {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${d.id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")

      const healthColor = getHealthColor(d.percentage)
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", healthColor.light)
        .attr("stop-opacity", 0.9)

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", healthColor.dark)
        .attr("stop-opacity", 1)
    })

    // Debt circles
    debtNodeGroups
      .append("circle")
      .attr("r", 45)
      .attr("fill", (d) => `url(#gradient-${d.id})`)
      .attr("stroke", (d) => getHealthColor(d.percentage).primary)
      .attr("stroke-width", 3)
      .attr("filter", "url(#glow)")
      .transition()
      .duration(1000)
      .attr("r", 50)

    // Progress circle (healing animation)
    debtNodeGroups
      .append("circle")
      .attr("r", 42)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", (d) => {
        const circumference = 2 * Math.PI * 42
        return `${(circumference * d.percentage) / 100} ${circumference}`
      })
      .attr("stroke-dashoffset", 0)
      .attr("transform", "rotate(-90)")
      .attr("opacity", 0.8)

    // Percentage text
    debtNodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .attr("fill", "white")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text((d) => `${Math.round(d.percentage)}%`)

    // Amount text
    debtNodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text((d) => `₹${d.paid.toLocaleString("en-IN")}`)

    // Name labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.level === 0 ? 50 : 75))
      .attr("fill", "currentColor")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d) => d.name)

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as DebtNode).x!)
        .attr("y1", (d) => (d.source as DebtNode).y!)
        .attr("x2", (d) => (d.target as DebtNode).x!)
        .attr("y2", (d) => (d.target as DebtNode).y!)
        .attr("stroke", (d) => {
          const target = d.target as DebtNode
          return getHealthColor(target.percentage).primary
        })

      node.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [debts, dimensions])

  const getHealthColor = (percentage: number) => {
    if (percentage < 25) {
      return { primary: "#dc2626", light: "#ef4444", dark: "#991b1b" } // Red
    } else if (percentage < 50) {
      return { primary: "#ea580c", light: "#f97316", dark: "#c2410c" } // Orange
    } else if (percentage < 75) {
      return { primary: "#ca8a04", light: "#eab308", dark: "#a16207" } // Yellow
    } else if (percentage < 100) {
      return { primary: "#16a34a", light: "#22c55e", dark: "#15803d" } // Light Green
    } else {
      return { primary: "#10b981", light: "#34d399", dark: "#059669" } // Emerald
    }
  }

  const handlePayment = async (amount: number) => {
    if (!selectedDebt) return

    try {
      await updateDebt(selectedDebt.id, {
        remainingAmount: selectedDebt.remainingAmount - amount,
        updatedAt: new Date(),
      })
      setSelectedDebt(null)
    } catch (error) {
      console.error("Error updating debt:", error)
    }
  }

  const translations = {
    hi: {
      title: "कर्ज का पेड़",
      description: "अपने कर्जों को देखें और प्रबंधित करें",
      noDebts: "कोई कर्ज नहीं! आप कर्ज मुक्त हैं 🎉",
      totalDebt: "कुल कर्ज",
      totalPaid: "भुगतान किया गया",
      remaining: "बाकी",
      progress: "प्रगति",
      makePayment: "भुगतान करें",
      fullscreen: "पूर्ण स्क्रीन",
    },
    mr: {
      title: "कर्जाचे झाड",
      description: "तुमचे कर्ज पहा आणि व्यवस्थापित करा",
      noDebts: "कर्ज नाही! तुम्ही कर्जमुक्त आहात 🎉",
      totalDebt: "एकूण कर्ज",
      totalPaid: "भरलेले",
      remaining: "उरलेले",
      progress: "प्रगती",
      makePayment: "पैसे द्या",
      fullscreen: "पूर्ण स्क्रीन",
    },
    ta: {
      title: "கடன் மரம்",
      description: "உங்கள் கடன்களைப் பார்த்து நிர்வகிக்கவும்",
      noDebts: "கடன் இல்லை! நீங்கள் கடனில்லாதவர் 🎉",
      totalDebt: "மொத்த கடன்",
      totalPaid: "செலுத்தப்பட்டது",
      remaining: "மீதம்",
      progress: "முன்னேற்றம்",
      makePayment: "பணம் செலுத்து",
      fullscreen: "முழு திரை",
    },
    en: {
      title: "Debt Tree",
      description: "Visualize and manage your debts",
      noDebts: "No debts! You're debt-free 🎉",
      totalDebt: "Total Debt",
      totalPaid: "Total Paid",
      remaining: "Remaining",
      progress: "Progress",
      makePayment: "Make Payment",
      fullscreen: "Fullscreen",
    },
  }

  const t = translations[language]

  // Calculate totals
  const totalDebt = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const totalRemaining = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0)
  const totalPaid = totalDebt - totalRemaining
  const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TreePine className="h-6 w-6 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
      </div>

      {/* Summary Cards */}
      {debts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.totalDebt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalDebt.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.totalPaid}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.remaining}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ₹{totalRemaining.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.progress}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(overallProgress)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tree Visualization */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {debts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-xl font-semibold text-green-600">{t.noDebts}</p>
            </div>
          ) : (
            <div className="relative bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
              <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full"
                style={{ minHeight: "600px" }}
              />

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-sm space-y-1">
                <p className="font-semibold">💡 Tips:</p>
                <p>• Click nodes to view details</p>
                <p>• Drag nodes to rearrange</p>
                <p>• Scroll to zoom in/out</p>
                <p>• Colors show healing progress</p>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-sm space-y-2">
                <p className="font-semibold">Legend:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span>&lt; 25% paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                    <span>25-50% paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span>50-75% paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span>&gt; 75% paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500" />
                    <span>100% paid ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Debt Modal */}
      <AnimatePresence>
        {selectedDebt && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDebt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {selectedDebt.lenderName || selectedDebt.name}
                  </CardTitle>
                  <CardDescription>
                    {(((selectedDebt.totalAmount - selectedDebt.remainingAmount) / selectedDebt.totalAmount) * 100).toFixed(1)}% paid
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">
                        ₹{selectedDebt.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-semibold text-green-600">
                        ₹{(selectedDebt.totalAmount - selectedDebt.remainingAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-red-600">
                        ₹{selectedDebt.remainingAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedDebt(null)} variant="outline" className="flex-1">
                      Close
                    </Button>
                    <Button onClick={() => handlePayment(100)} className="flex-1">
                      {t.makePayment}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
