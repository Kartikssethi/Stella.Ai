"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from '@tiptap/extensions'
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLiveSuggestions } from "@/hooks/use-live-suggestions"
import { LiveSuggestionsOverlay } from "@/components/live-suggestions-overlay"
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
    const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 })
    const editorRef = useRef(null)

    // Always ensure we have a userId (fallback for testing)
    const effectiveUserId = userId || "demo-user"
    
    console.log('TipTap Editor initialized with userId:', effectiveUserId)

    // Use the new live suggestions hook
    const {
        suggestions,
        isLoading: isLoadingSuggestions,
        showSuggestions,
        selectedSuggestionIndex,
        fetchLiveSuggestions,
        hideSuggestions,
        acceptSuggestion,
        navigateSuggestions
    } = useLiveSuggestions(effectiveUserId)

    // Test: Show some dummy suggestions for debugging
    useEffect(() => {
        console.log('Current suggestions state:', { suggestions, showSuggestions, isLoadingSuggestions })
    }, [suggestions, showSuggestions, isLoadingSuggestions])

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
            
            // Trigger live suggestions on content change (like GitHub Copilot)
            const text = editor.getText()
            const cursorPosition = editor.state.selection.anchor
            
            console.log('Editor updated:', { text: text.slice(0, 50), cursorPosition, userId: effectiveUserId })
            
            // Trigger suggestions for any text input (more aggressive)
            if (text.trim().length > 2 && effectiveUserId) {
                console.log('Triggering live suggestions for text:', text.slice(-20))
                fetchLiveSuggestions(text, cursorPosition)
            }
        },
        onSelectionUpdate: ({ editor }) => {
            // Update suggestion position when cursor moves
            updateSuggestionPosition(editor)
        },
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8 relative",
            },
        },
    })

    // Update suggestion position based on cursor location
    const updateSuggestionPosition = useCallback((editor) => {
        if (!editor || !editorRef.current) return

        try {
            const { from } = editor.state.selection
            const coords = editor.view.coordsAtPos(from)
            const editorRect = editorRef.current.getBoundingClientRect()
            
            setSuggestionPosition({
                x: coords.left - editorRect.left + 20,
                y: coords.top - editorRect.top + 20
            })
        } catch (error) {
            console.error('Error updating suggestion position:', error)
        }
    }, [])

    // Handle suggestion acceptance
    const handleAcceptSuggestion = useCallback((suggestionIndex = null) => {
        const suggestion = acceptSuggestion(suggestionIndex)
        if (suggestion && editor) {
            // Insert the suggestion at the current cursor position
            const currentText = editor.getText()
            const cursorPosition = editor.state.selection.anchor
            
            // Add the suggestion with a space
            const suggestionText = ` ${suggestion}`
            editor.commands.insertContent(suggestionText)
        }
    }, [acceptSuggestion, editor])

    // Handle suggestion rejection
    const handleRejectSuggestion = useCallback(() => {
        hideSuggestions()
    }, [hideSuggestions])

    // Handle suggestion navigation
    const handleNavigateSuggestions = useCallback((direction) => {
        navigateSuggestions(direction)
    }, [navigateSuggestions])

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
                        Getting AI suggestions...
                    </div>
                )}

                {/* Debug button for testing */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        console.log('Test button clicked - triggering suggestions')
                        fetchLiveSuggestions("Once upon a time", 15)
                    }}
                >
                    Test Suggestions
                </Button>
            </div>

            {/* Editor with Live Suggestions */}
            <div className="flex-1 overflow-auto relative" ref={editorRef}>
                <div className="max-w-4xl mx-auto relative">
                    <EditorContent editor={editor} />

                    {/* Live Suggestions Overlay (GitHub Copilot style) */}
                    <LiveSuggestionsOverlay
                        suggestions={suggestions}
                        isLoading={isLoadingSuggestions}
                        showSuggestions={showSuggestions}
                        selectedIndex={selectedSuggestionIndex}
                        onAccept={handleAcceptSuggestion}
                        onReject={handleRejectSuggestion}
                        onNavigate={handleNavigateSuggestions}
                        position={suggestionPosition}
                    />
                </div>
            </div>
        </div>
    )
}
