"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import { EnhancedTipTapEditor } from "@/components/EnhancedTipTapEditor"


export function EditorArea({ document, onUpdateDocument, onClose, sessionId: propSessionId, userId }) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(document.content)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionId, setSessionId] = useState(propSessionId || "")

  useEffect(() => {
    setTitle(document.title)
    setContent(document.content)
    if (propSessionId) {
      setSessionId(propSessionId)
    } else {
      setSessionId(`session-${document.id}-${Date.now()}`)
    }
  }, [document, propSessionId])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    onUpdateDocument({
      ...document,
      title,
      content,
    })
    setIsSaving(false)
  }

  const handleContentChange = (newContent) => {
    setContent(newContent)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
            placeholder="Document title..."
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <EnhancedTipTapEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your document here..."
          userId={userId || document.createdBy || "test-user"} 
          sessionId={sessionId}
          documentId={document.id}
        />
      </div>
    </div>
  )
}
