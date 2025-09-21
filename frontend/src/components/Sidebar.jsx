"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PenTool, Scale, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"


const workspaces = [
    {
        id: "creative-writing",
        name: "Creative Writing",
        icon: PenTool,
        color: "text-purple-600",
    },
    {
        id: "legal-writing",
        name: "Legal Writing",
        icon: Scale,
        color: "text-blue-600",
    },
]

export function Sidebar({
    activeWorkspace,
    onWorkspaceChange,
    documents,
    selectedDocument,
    onDocumentSelect,
    onCreateDocument,
}) {
    return (
        <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
            {/* Workspaces Section */}
            <div className="p-4">
                <h2 className="text-sm font-semibold text-sidebar-foreground mb-3">Workspaces</h2>
                <div className="space-y-1">
                    {workspaces.map((workspace) => {
                        const Icon = workspace.icon
                        const isActive = activeWorkspace === workspace.id

                        return (
                            <Button
                                key={workspace.id}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-10",
                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                                )}
                                onClick={() => onWorkspaceChange(workspace.id)}
                            >
                                <Icon className={cn("h-4 w-4", workspace.color)} />
                                {workspace.name}
                            </Button>
                        )
                    })}
                </div>
            </div>

            <Separator />

            {/* Documents Section */}
            <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-sidebar-foreground">Documents</h2>
                    <Button size="sm" variant="ghost" onClick={onCreateDocument} className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-1">
                        {documents.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                No documents yet.
                                <br />
                                Click + to create your first document.
                            </div>
                        ) : (
                            documents.map((document) => (
                                <Button
                                    key={document.id}
                                    variant={selectedDocument?.id === document.id ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-3 h-auto p-3 text-left"
                                    onClick={() => onDocumentSelect(document)}
                                >
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{document.title || "Untitled"}</div>
                                        {document.summary && (
                                            <div className="text-xs text-muted-foreground truncate mt-1">{document.summary}</div>
                                        )}
                                    </div>
                                </Button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
