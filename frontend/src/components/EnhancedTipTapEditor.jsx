"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from '@tiptap/extensions'
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SuggestionOverlay } from "@/components/suggestion-overlay"
import { useRealtimeSuggestions } from "@/hooks/use-realtime-suggestions"
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
    const [paragraphs, setParagraphs] = useState([])
    const [activeParagraphId, setActiveParagraphId] = useState(null)
    const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 })
    const editorRef = useRef(null)
    const paragraphRefs = useRef({})

    // Use the real-time suggestions hook
    const {
        fetchSuggestions,
        getSuggestions,
        clearSuggestions,
        acceptSuggestion,
        rejectSuggestion,
        applySuggestion,
        getParagraphAnalysis,
        isLoading: isLoadingSuggestions,
        error: suggestionsError
    } = useRealtimeSuggestions(userId, sessionId)

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
            updateParagraphs(newContent)
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8 relative",
            },
        },
    })

    // Update paragraphs when content changes
    const updateParagraphs = useCallback((htmlContent) => {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = htmlContent
        const paragraphElements = tempDiv.querySelectorAll("p")
        
        const newParagraphs = Array.from(paragraphElements).map((p, index) => {
            const text = p.textContent || ""
            const paragraphId = `paragraph-${index}-${text.slice(0, 20).replace(/\s/g, '-')}`
            
            return {
                id: paragraphId,
                text,
                index,
                element: p
            }
        })
        
        setParagraphs(newParagraphs)
    }, [])

    // Handle paragraph click to show suggestions
    const handleParagraphClick = useCallback((paragraphId, event) => {
        const paragraph = paragraphs.find(p => p.id === paragraphId)
        if (!paragraph || !paragraph.text.trim()) return

        // Calculate position for suggestion overlay
        const rect = event.currentTarget.getBoundingClientRect()
        const editorRect = editorRef.current?.getBoundingClientRect()
        
        if (editorRect) {
            setSuggestionPosition({
                x: rect.right - editorRect.left + 20,
                y: rect.top - editorRect.top
            })
        }

        setActiveParagraphId(paragraphId)
        
        // Fetch suggestions for this paragraph
        fetchSuggestions(paragraphId, paragraph.text)
    }, [paragraphs, fetchSuggestions])

    // Handle suggestion actions
    const handleAcceptSuggestion = useCallback((suggestion) => {
        acceptSuggestion(activeParagraphId, suggestion.id)
        console.log("Suggestion accepted:", suggestion)
    }, [activeParagraphId, acceptSuggestion])

    const handleRejectSuggestion = useCallback((suggestion) => {
        rejectSuggestion(activeParagraphId, suggestion.id)
        console.log("Suggestion rejected:", suggestion)
    }, [activeParagraphId, rejectSuggestion])

    const handleApplySuggestion = useCallback((suggestion) => {
        if (!editor) return
        
        const paragraph = paragraphs.find(p => p.id === activeParagraphId)
        if (!paragraph) return

        const appliedText = applySuggestion(activeParagraphId, suggestion.id, paragraph.text)
        
        // Update the editor content with the applied suggestion
        const currentContent = editor.getHTML()
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = currentContent
        
        const paragraphElements = tempDiv.querySelectorAll("p")
        const targetParagraph = paragraphElements[paragraph.index]
        
        if (targetParagraph) {
            targetParagraph.innerHTML = appliedText
            editor.commands.setContent(tempDiv.innerHTML)
        }
        
        console.log("Suggestion applied:", suggestion)
    }, [activeParagraphId, applySuggestion, editor, paragraphs])

    // Initialize paragraphs when content changes
    useEffect(() => {
        if (content) {
            updateParagraphs(content)
        }
    }, [content, updateParagraphs])

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

                    {/* Render paragraphs with click handlers */}
                    {paragraphs.map((paragraph) => {
                        const suggestions = getSuggestions(paragraph.id)
                        const analysis = getParagraphAnalysis(paragraph.id)
                        
                        return (
                            <div key={paragraph.id}>
                                {/* Paragraph click area for suggestions */}
                                <div
                                    className="cursor-pointer hover:bg-muted/20 rounded p-1 -m-1 transition-colors"
                                    onClick={(e) => handleParagraphClick(paragraph.id, e)}
                                    title="Click for AI suggestions"
                                >
                                    {/* This will be handled by the editor content */}
                                </div>
                                
                                {/* Show suggestion overlay for active paragraph */}
                                {activeParagraphId === paragraph.id && suggestions && (
                                    <SuggestionOverlay
                                        paragraphId={paragraph.id}
                                        paragraphText={paragraph.text}
                                        position={suggestionPosition}
                                        onAccept={handleAcceptSuggestion}
                                        onReject={handleRejectSuggestion}
                                        onApplySuggestion={handleApplySuggestion}
                                        isVisible={true}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
