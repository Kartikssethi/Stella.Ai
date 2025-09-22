"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Lightbulb, ArrowUp, ArrowDown, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function LiveSuggestionsOverlay({
  suggestions,
  isLoading,
  showSuggestions,
  selectedIndex,
  onAccept,
  onReject,
  onNavigate,
  position = { x: 0, y: 0 }
}) {
  console.log('LiveSuggestionsOverlay render:', { 
    suggestions, 
    isLoading, 
    showSuggestions, 
    selectedIndex,
    position 
  })
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!showSuggestions) return

      switch (event.key) {
        case 'Tab':
          event.preventDefault()
          onAccept(selectedIndex)
          break
        case 'Escape':
          event.preventDefault()
          onReject()
          break
        case 'ArrowUp':
          event.preventDefault()
          onNavigate('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          onNavigate('down')
          break
      }
    }

    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSuggestions, selectedIndex, onAccept, onReject, onNavigate])

  if (!showSuggestions && !isLoading) {
    // Always show a debug overlay for testing
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-300 p-2 text-xs">
          Debug: No suggestions (showSuggestions: {showSuggestions.toString()}, isLoading: {isLoading.toString()})
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="fixed z-50 max-w-md"
      style={{
        left: `${Math.max(10, position.x)}px`,
        top: `${Math.max(10, position.y)}px`,
      }}
    >
      <Card className="border-2 border-primary bg-background shadow-xl">
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Getting suggestions...</span>
              </>
            ) : (
              <>
                <Lightbulb className="h-3 w-3" />
                <span>AI Suggestions</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  Tab to accept
                </span>
              </>
            )}
          </div>

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded text-sm cursor-pointer transition-colors",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => onAccept(index)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {index + 1}
                    </span>
                    <span className="flex-1">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          {!isLoading && suggestions.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                <span>Navigate</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => onAccept(selectedIndex)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={onReject}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}