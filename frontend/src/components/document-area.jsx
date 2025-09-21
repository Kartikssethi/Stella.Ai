"use client"


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, FileText } from "lucide-react"


export function DocumentArea({ workspace, onCreateDocument, onCancel }) {
    const [title, setTitle] = useState("")
    const [summary, setSummary] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState([])

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files || [])
        setUploadedFiles((prev) => [...prev, ...files])
    }

    const removeFile = (index) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const processUploadedFiles = () => {
        return uploadedFiles.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // In a real app, you'd upload to a server/cloud storage
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim()) return

        onCreateDocument({
            title: title.trim(),
            summary: summary.trim(),
            content: "",
            workspace,
            attachedFiles: processUploadedFiles(),
        })
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const workspaceTitle = workspace === "creative-writing" ? "Creative Writing" : "Legal Writing"

    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Document</CardTitle>
                    <p className="text-muted-foreground">Starting a new document in {workspaceTitle}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Document Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your document title..."
                                className="text-lg"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Brief Summary</Label>
                            <Textarea
                                id="summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Provide a brief summary of what this document will cover..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Prior Documents (Optional)</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Upload any reference documents to help with your writing
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.doc,.docx,.txt,.md"
                                />
                                <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                                    Choose Files
                                </Button>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Uploaded Files:</p>
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1">
                                Start Writing
                            </Button>
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
