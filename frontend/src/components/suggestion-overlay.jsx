"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  AlertCircle
} from "lucide-react"

export function SuggestionOverlay({ 
  paragraphId, 
  paragraphText, 
  position, 
  onAccept, 
  onReject, 
  onApplySuggestion,
  isVisible = false 
}) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const overlayRef = useRef(null)

  // Auto-fetch suggestions when overlay becomes visible
  useEffect(() => {
    if (isVisible && paragraphText.trim()) {
      fetchSuggestions()
    }
  }, [isVisible, paragraphText])

  const fetchSuggestions = async () => {
    if (!paragraphText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // This would be replaced with actual API call
      const mockSuggestions = [
        {
          id: 1,
          text: "Consider adding more descriptive language to enhance the atmosphere.",
          type: "improvement",
          confidence: 0.85
        },
        {
          id: 2, 
          text: "This paragraph could benefit from more specific details about the setting.",
          type: "enhancement",
          confidence: 0.78
        },
        {
          id: 3,
          text: "The dialogue here could be more natural and character-specific.",
          type: "dialogue",
          confidence: 0.72
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuggestions(mockSuggestions)
    } catch (err) {
      setError("Failed to fetch suggestions")
      console.error("Error fetching suggestions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = (suggestion) => {
    onAccept?.(suggestion)
    setSelectedSuggestion(suggestion)
  }

  const handleReject = (suggestion) => {
    onReject?.(suggestion)
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const handleApplySuggestion = (suggestion) => {
    onApplySuggestion?.(suggestion)
    setSelectedSuggestion(suggestion)
  }

  const getSuggestionTypeColor = (type) => {
    switch (type) {
      case "improvement": return "bg-blue-100 text-blue-800"
      case "enhancement": return "bg-green-100 text-green-800"
      case "dialogue": return "bg-purple-100 text-purple-800"
      case "style": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  if (!isVisible) return null

  return (
    <div
      ref={overlayRef}
      className="absolute z-50 w-80 max-h-96 overflow-y-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-100%)'
      }}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">AI Suggestions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSuggestions}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Analyzing...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No suggestions available for this paragraph.
            </div>
          )}

          {!isLoading && !error && suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="border rounded-lg p-3 space-y-2 bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getSuggestionTypeColor(suggestion.type)}`}
                    >
                      {suggestion.type}
                    </Badge>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{suggestion.text}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAccept(suggestion)}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(suggestion)}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
                {suggestion.type === "improvement" && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="h-7 px-2 text-xs"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                )}
              </div>
            </div>
          ))}

          {selectedSuggestion && (
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <Check className="h-4 w-4" />
                <span>Applied suggestion: {selectedSuggestion.type}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}