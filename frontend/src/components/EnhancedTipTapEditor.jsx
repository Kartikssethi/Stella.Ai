"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from '@tiptap/extensions'
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SuggestionOverlay } from "@/components/suggestion-overlay"
import { writingApi } from "@/lib/api"
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function EnhancedTipTapEditor({
    content,
    onChange,
    placeholder = "Start writing...",
    userId,
    sessionId,
    documentId,
}) {
    const [suggestions, setSuggestions] = useState([])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const debounceRef = useRef()
    const editorRef = useRef(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
        ],
        content,
        immediatelyRender: false, // 👈 this prevents SSR hydration mismatch
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML()
            onChange(newContent)
            debouncedGetSuggestions(newContent)
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8 relative",
            },
        },
    })


    const debouncedGetSuggestions = useCallback(
        (text) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }

            debounceRef.current = setTimeout(async () => {
                await getSuggestionsForContent(text)
            }, 1000)
        },
        [userId, sessionId]
    )

    const getSuggestionsForContent = async (text) => {
        if (!text.trim() || text.length < 50) return

        setIsLoadingSuggestions(true)
        try {
            const paragraphs = extractParagraphs(text)
            const newSuggestions = []

            for (let i = 0; i < paragraphs.length; i++) {
                const paragraph = paragraphs[i]
                if (paragraph.trim().length > 20) {
                    const response = await writingApi.getAutoSuggestions({
                        user_id: userId,
                        session_id: sessionId,
                        current_text: paragraph,
                        document_context: documentId || undefined,
                    })

                    if (response.suggestions && response.suggestions.length > 0) {
                        const position = getParagraphPosition(i)
                        newSuggestions.push({
                            id: `${i}-${Date.now()}`,
                            text: response.suggestions[0],
                            type: response.suggestion_type,
                            confidence: response.confidence_score,
                            position,
                            paragraphIndex: i,
                        })
                    }
                }
            }

            setSuggestions(newSuggestions)
        } catch (error) {
            console.error("[v0] Error getting suggestions:", error)
        } finally {
            setIsLoadingSuggestions(false)
        }
    }

    const extractParagraphs = (htmlContent) => {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = htmlContent
        const paragraphs = tempDiv.querySelectorAll("p")
        return Array.from(paragraphs).map((p) => p.textContent || "")
    }

    const getParagraphPosition = (paragraphIndex) => {
        if (!editorRef.current) return { top: 0, left: 0 }

        const paragraphs = editorRef.current.querySelectorAll("p")
        if (paragraphs[paragraphIndex]) {
            const rect = paragraphs[paragraphIndex].getBoundingClientRect()
            const editorRect = editorRef.current.getBoundingClientRect()
            return {
                top: rect.top - editorRect.top,
                left: rect.right - editorRect.left + 20,
            }
        }
        return { top: 0, left: 0 }
    }

    const handleAcceptSuggestion = (suggestionId) => {
        const suggestion = suggestions.find((s) => s.id === suggestionId)
        if (!suggestion || !editor) return

        try {
            const currentContent = editor.getHTML()
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = currentContent

            const paragraphs = tempDiv.querySelectorAll("p")
            const targetParagraph = paragraphs[suggestion.paragraphIndex]

            if (targetParagraph) {
                const currentText = targetParagraph.textContent || ""
                const needsSpace =
                    currentText.length > 0 && !currentText.endsWith(" ")
                targetParagraph.innerHTML += `${needsSpace ? " " : ""}${suggestion.text
                    }`

                editor.commands.setContent(tempDiv.innerHTML)
                setTimeout(() => {
                    editor.commands.focus("end")
                }, 100)
            }
        } catch (error) {
            console.error("[v0] Error accepting suggestion:", error)
            const currentContent = editor.getHTML()
            editor.commands.setContent(currentContent + ` ${suggestion.text}`)
        }

        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))

        console.log("[v0] Suggestion accepted:", {
            suggestionId,
            type: suggestion.type,
            confidence: suggestion.confidence,
            userId,
            sessionId,
        })
    }

    const handleRejectSuggestion = (suggestionId) => {
        const suggestion = suggestions.find((s) => s.id === suggestionId)

        if (suggestion) {
            console.log("[v0] Suggestion rejected:", {
                suggestionId,
                type: suggestion.type,
                confidence: suggestion.confidence,
                userId,
                sessionId,
            })
        }

        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    }

    if (!editor) {
        return null
    }

    const ToolbarButton = ({ onClick, isActive = false, children, disabled }) => (
        <Button
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn("h-8 w-8 p-0", isActive && "bg-secondary")}
        >
            {children}
        </Button>
    )

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="border-b border-border p-2 flex items-center gap-1 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive("code")}
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>

                {isLoadingSuggestions && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        Getting suggestions...
                    </div>
                )}
            </div>

            {/* Editor with Suggestions */}
            <div className="flex-1 overflow-auto relative" ref={editorRef}>
                <div className="max-w-4xl mx-auto relative">
                    <EditorContent editor={editor} />

                    {suggestions.map((suggestion) => (
                        <SuggestionOverlay
                            key={suggestion.id}
                            suggestion={suggestion}
                            onAccept={() => handleAcceptSuggestion(suggestion.id)}
                            onReject={() => handleRejectSuggestion(suggestion.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
