'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { writingApi } from '@/lib/api'

export function useLiveSuggestions(userId) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const debounceTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Debounced function to fetch live suggestions
  const fetchLiveSuggestions = useCallback(
    async (currentText, cursorPosition = null) => {
      console.log('fetchLiveSuggestions called:', {
        userId,
        currentText,
        cursorPosition,
      })

      if (!userId) {
        console.log('No userId provided')
        return
      }

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Debounce the request by 500ms (faster for testing)
      debounceTimeoutRef.current = setTimeout(async () => {
        console.log('Making API call for suggestions...')
        try {
          setIsLoading(true)

          // Create abort controller for this request
          const controller = new AbortController()
          abortControllerRef.current = controller

          const requestData = {
            user_id: userId,
            current_text: currentText,
            cursor_position: cursorPosition,
          }

          console.log('API request data:', requestData)
          const response = await writingApi.getLiveSuggestions(requestData)
          console.log('API response:', response)

          // Check if request was aborted
          if (controller.signal.aborted) return

          setSuggestions(response.suggestions || [])
          setSelectedSuggestionIndex(0)
          setShowSuggestions(
            response.suggestions && response.suggestions.length > 0,
          )
          console.log('Suggestions set:', response.suggestions)
        } catch (err) {
          if (err.name === 'AbortError') return // Ignore aborted requests

          console.error('Error fetching live suggestions:', err)
          setSuggestions([])
          setShowSuggestions(false)
        } finally {
          setIsLoading(false)
        }
      }, 500)
    },
    [userId],
  )

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedSuggestionIndex(0)
  }, [])

  // Accept suggestion
  const acceptSuggestion = useCallback(
    (index = null) => {
      const suggestionIndex = index !== null ? index : selectedSuggestionIndex
      const suggestion = suggestions[suggestionIndex]
      if (suggestion) {
        hideSuggestions()
        return suggestion
      }
      return null
    },
    [suggestions, selectedSuggestionIndex, hideSuggestions],
  )

  // Navigate suggestions
  const navigateSuggestions = useCallback(
    (direction) => {
      if (!suggestions.length) return

      if (direction === 'up') {
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        )
      } else if (direction === 'down') {
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        )
      }
    },
    [suggestions.length],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestions,
    isLoading,
    showSuggestions,
    selectedSuggestionIndex,
    fetchLiveSuggestions,
    hideSuggestions,
    acceptSuggestion,
    navigateSuggestions,
  }
}
