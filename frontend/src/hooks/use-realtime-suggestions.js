"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { writingApi } from "@/lib/api"

export function useRealtimeSuggestions(userId, sessionId) {
  const [suggestions, setSuggestions] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceTimeoutRef = useRef(null)
  const lastRequestRef = useRef(null)

  // Debounced function to fetch suggestions
  const fetchSuggestions = useCallback(async (paragraphId, text, cursorPosition = null) => {
    if (!text.trim() || !userId || !sessionId) return

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce the request by 500ms
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const requestData = {
          user_id: userId,
          session_id: sessionId,
          current_text: text,
          cursor_position: cursorPosition,
          document_context: "paragraph_analysis"
        }

        // Cancel previous request if it's still pending
        if (lastRequestRef.current) {
          lastRequestRef.current.abort()
        }

        // Create abort controller for this request
        const controller = new AbortController()
        lastRequestRef.current = controller

        const response = await writingApi.getEnhancedAutoSuggestions(requestData)
        
        // Check if request was aborted
        if (controller.signal.aborted) return

        setSuggestions(prev => ({
          ...prev,
          [paragraphId]: {
            suggestions: response.text_suggestions || [],
            suggestionType: response.suggestion_type || 'continuation',
            confidenceScore: response.confidence_score || 0,
            contextUsed: response.context_used || '',
            plotInsights: response.plot_insights || {},
            timestamp: Date.now()
          }
        }))

      } catch (err) {
        if (err.name === 'AbortError') return // Ignore aborted requests
        
        console.error('Error fetching suggestions:', err)
        setError(err.message)
        
        // Set empty suggestions for this paragraph
        setSuggestions(prev => ({
          ...prev,
          [paragraphId]: {
            suggestions: [],
            error: err.message,
            timestamp: Date.now()
          }
        }))
      } finally {
        setIsLoading(false)
      }
    }, 500)
  }, [userId, sessionId])

  // Function to get suggestions for a specific paragraph
  const getSuggestions = useCallback((paragraphId) => {
    return suggestions[paragraphId] || null
  }, [suggestions])

  // Function to clear suggestions for a paragraph
  const clearSuggestions = useCallback((paragraphId) => {
    setSuggestions(prev => {
      const newSuggestions = { ...prev }
      delete newSuggestions[paragraphId]
      return newSuggestions
    })
  }, [])

  // Function to accept a suggestion
  const acceptSuggestion = useCallback((paragraphId, suggestionIndex) => {
    setSuggestions(prev => {
      const paragraphSuggestions = prev[paragraphId]
      if (!paragraphSuggestions) return prev

      return {
        ...prev,
        [paragraphId]: {
          ...paragraphSuggestions,
          acceptedSuggestion: suggestionIndex,
          acceptedAt: Date.now()
        }
      }
    })
  }, [])

  // Function to reject a suggestion
  const rejectSuggestion = useCallback((paragraphId, suggestionIndex) => {
    setSuggestions(prev => {
      const paragraphSuggestions = prev[paragraphId]
      if (!paragraphSuggestions) return prev

      const newSuggestions = paragraphSuggestions.suggestions.filter((_, index) => index !== suggestionIndex)
      
      return {
        ...prev,
        [paragraphId]: {
          ...paragraphSuggestions,
          suggestions: newSuggestions,
          rejectedSuggestions: [
            ...(paragraphSuggestions.rejectedSuggestions || []),
            suggestionIndex
          ]
        }
      }
    })
  }, [])

  // Function to apply a suggestion (modify the text)
  const applySuggestion = useCallback((paragraphId, suggestionIndex, originalText) => {
    const paragraphSuggestions = suggestions[paragraphId]
    if (!paragraphSuggestions || !paragraphSuggestions.suggestions[suggestionIndex]) {
      return originalText
    }

    const suggestion = paragraphSuggestions.suggestions[suggestionIndex]
    
    // This is a simplified implementation
    // In a real app, you'd want more sophisticated text replacement logic
    const appliedText = `${originalText}\n\n[AI Suggestion Applied: ${suggestion}]`
    
    // Mark suggestion as applied
    setSuggestions(prev => ({
      ...prev,
      [paragraphId]: {
        ...prev[paragraphId],
        appliedSuggestion: suggestionIndex,
        appliedAt: Date.now()
      }
    }))

    return appliedText
  }, [suggestions])

  // Function to get paragraph analysis
  const getParagraphAnalysis = useCallback((paragraphId) => {
    const paragraphSuggestions = suggestions[paragraphId]
    if (!paragraphSuggestions) return null

    return {
      hasSuggestions: paragraphSuggestions.suggestions?.length > 0,
      suggestionCount: paragraphSuggestions.suggestions?.length || 0,
      confidenceScore: paragraphSuggestions.confidenceScore || 0,
      suggestionType: paragraphSuggestions.suggestionType || 'unknown',
      hasError: !!paragraphSuggestions.error,
      error: paragraphSuggestions.error,
      timestamp: paragraphSuggestions.timestamp,
      plotInsights: paragraphSuggestions.plotInsights || {}
    }
  }, [suggestions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (lastRequestRef.current) {
        lastRequestRef.current.abort()
      }
    }
  }, [])

  return {
    fetchSuggestions,
    getSuggestions,
    clearSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    applySuggestion,
    getParagraphAnalysis,
    isLoading,
    error,
    suggestions
  }
}
