"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Lightbulb, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function SuggestionOverlay({ suggestion, onAccept, onReject }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAccept = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onAccept()
      setIsVisible(false)
    }, 200)
  }

  const handleReject = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onReject()
      setIsVisible(false)
    }, 200)
  }

  const getSuggestionIcon = (type) => {
    switch (type.toLowerCase()) {
      case "creative":
      case "enhancement":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "improvement":
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  if (!isVisible) return null

  return (
    <div
      className={cn("absolute z-50 transition-all duration-200", isAnimating && "scale-95 opacity-50")}
      style={{
        top: suggestion.position.top,
        left: suggestion.position.left,
      }}
    >
      <Card className="w-80 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{getSuggestionIcon(suggestion.type)}</div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn("text-xs", getConfidenceColor(suggestion.confidence))}>
                  {Math.round(suggestion.confidence * 100)}% confidence
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {suggestion.type}
                </Badge>
              </div>

              <div className="text-sm text-foreground leading-relaxed">{suggestion.text}</div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-200 bg-transparent"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pointer arrow */}
      <div className="absolute left-0 top-4 -translate-x-2">
        <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-t-transparent border-b-transparent border-r-primary/20" />
        <div className="absolute top-0.5 left-0.5 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-background" />
      </div>
    </div>
  )
}
