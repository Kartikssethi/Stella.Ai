"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { writingApi } from "@/lib/api"
import { Sidebar } from "@/components/sidebar"
import { DocumentArea } from "@/components/document-area"
import { EditorArea } from "@/components/editor-area"
import { UserOnboardingDialog } from "@/components/user-onboarding-dialog"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const [activeWorkspace, setActiveWorkspace] = useState("creative")
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewState, setViewState] = useState("workspace")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is new and load documents
  useEffect(() => {
    const initializeUser = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Check if user is new
        const userIsNew = await writingApi.isNewUser(session.user.id)
        setIsNewUser(userIsNew)
        
        if (userIsNew) {
          setShowOnboarding(true)
        } else {
          // Load user's documents from API
          const userDocuments = await writingApi.getUserDocuments(session.user.id)
          setDocuments(userDocuments)
        }
      } catch (error) {
        console.error("Error initializing user:", error)
        // Fallback to localStorage
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
          } catch (parseError) {
            console.error("Error parsing saved documents:", parseError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [session?.user?.id])

  // Save documents to localStorage as backup
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("writing-assistant-documents", JSON.stringify(documents))
    }
  }, [documents])

  const handleCreateDocument = async (documentData) => {
    try {
      // Create document via API
      const apiDocument = await writingApi.createDocument({
        title: documentData.title,
        type: documentData.type,
        description: documentData.description || "",
        created_by: session.user.id
      })

      const newDocument = {
        ...apiDocument.document,
        createdAt: new Date(apiDocument.document.created_at),
        updatedAt: new Date(apiDocument.document.updated_at),
        workspace: activeWorkspace
      }

      setDocuments((prev) => [newDocument, ...prev])
      setSelectedDocument(newDocument)
      setViewState("edit-document")
    } catch (error) {
      console.error("Error creating document:", error)
      // Fallback to local creation
      const newDocument = {
        ...documentData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        workspace: activeWorkspace
      }

      setDocuments((prev) => [newDocument, ...prev])
      setSelectedDocument(newDocument)
      setViewState("edit-document")
    }
  }

  const handleUpdateDocument = async (updatedDocument) => {
    try {
      // Update document via API
      await writingApi.updateDocument(updatedDocument.id, {
        title: updatedDocument.title,
        type: updatedDocument.type,
        description: updatedDocument.description || ""
      })

      const updated = {
        ...updatedDocument,
        updatedAt: new Date(),
      }

      setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)))
      setSelectedDocument(updated)
    } catch (error) {
      console.error("Error updating document:", error)
      // Fallback to local update
      const updated = {
        ...updatedDocument,
        updatedAt: new Date(),
      }

      setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)))
      setSelectedDocument(updated)
    }
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

  const handleDomainSelection = async (domain) => {
    try {
      // Start session for selected domain
      const sessionResponse = domain === "creative" 
        ? await writingApi.startCreativeSession(session.user.id)
        : await writingApi.startLegalSession(session.user.id)
      
      setSessionId(sessionResponse.session_id)
      setActiveWorkspace(domain)
      setShowOnboarding(false)
    } catch (error) {
      console.error("Error starting session:", error)
      // Still proceed with domain selection
      setActiveWorkspace(domain)
      setShowOnboarding(false)
    }
  }

  const filteredDocuments = documents.filter((doc) => doc.workspace === activeWorkspace)

  // Show loading state
  if (isPending || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if no session
  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to continue</h1>
          <p className="text-muted-foreground">You need to be logged in to access the writing assistant.</p>
        </div>
      </div>
    )
  }

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
              {activeWorkspace === "creative" ? "Creative Writing" : "Legal Writing"} Workspace
            </h1>
            <p className="text-muted-foreground max-w-md">
              {activeWorkspace === "creative"
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
        <EditorArea 
          document={selectedDocument} 
          onUpdateDocument={handleUpdateDocument} 
          onClose={handleCloseEditor}
          sessionId={sessionId}
          userId={session.user.id}
        />
      )}

      {/* User Onboarding Dialog */}
      <UserOnboardingDialog
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSelectDomain={handleDomainSelection}
        user={session.user}
      />
    </div>
  )
}
