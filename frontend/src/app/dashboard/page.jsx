"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DocumentArea } from "@/components/document-area"
import { EditorArea } from "@/components/editor-area"

export default function DashboardPage() {
  const [activeWorkspace, setActiveWorkspace] = useState("creative-writing")
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewState, setViewState] = useState("workspace")

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem("writing-assistant-documents")
    if (savedDocuments) {
      try {
        const parsed = JSON.parse(savedDocuments)
        setDocuments(
          parsed.map((doc) => ({
            ...doc,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
          })),
        )
      } catch (error) {
        console.error("[v0] Error loading documents:", error)
      }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem("writing-assistant-documents", JSON.stringify(documents))
  }, [documents])

  const handleCreateDocument = (documentData) => {
    const newDocument = {
      ...documentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "user-1", // In real app, get from auth
    }

    setDocuments((prev) => [newDocument, ...prev])
    setSelectedDocument(newDocument)
    setViewState("edit-document")
  }

  const handleUpdateDocument = (updatedDocument) => {
    const updated = {
      ...updatedDocument,
      updatedAt: new Date(),
    }

    setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)))
    setSelectedDocument(updated)
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
    setViewState("edit-document")
  }

  const handleStartCreateDocument = () => {
    setViewState("create-document")
  }

  const handleCancelCreate = () => {
    setViewState("workspace")
  }

  const handleCloseEditor = () => {
    setSelectedDocument(null)
    setViewState("workspace")
  }

  const filteredDocuments = documents.filter((doc) => doc.workspace === activeWorkspace)

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        documents={filteredDocuments}
        selectedDocument={selectedDocument}
        onDocumentSelect={handleDocumentSelect}
        onCreateDocument={handleStartCreateDocument}
      />

      {viewState === "workspace" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              {activeWorkspace === "creative-writing" ? "Creative Writing" : "Legal Writing"} Workspace
            </h1>
            <p className="text-muted-foreground max-w-md">
              {activeWorkspace === "creative-writing"
                ? "Unleash your creativity with AI-powered writing assistance for stories, novels, and creative content."
                : "Professional legal writing with AI assistance for contracts, briefs, and legal documents."}
            </p>
            <button
              onClick={handleStartCreateDocument}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create New Document
            </button>
          </div>
        </div>
      )}

      {viewState === "create-document" && (
        <DocumentArea
          workspace={activeWorkspace}
          onCreateDocument={handleCreateDocument}
          onCancel={handleCancelCreate}
        />
      )}

      {viewState === "edit-document" && selectedDocument && (
        <EditorArea document={selectedDocument} onUpdateDocument={handleUpdateDocument} onClose={handleCloseEditor} />
      )}
    </div>
  )
}
