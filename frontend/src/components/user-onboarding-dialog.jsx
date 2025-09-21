"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Scale, Sparkles, BookOpen, Gavel } from "lucide-react"

export function UserOnboardingDialog({ isOpen, onClose, onSelectDomain, user }) {
  const [selectedDomain, setSelectedDomain] = useState(null)

  if (!isOpen) return null

  const domains = [
    {
      id: "creative",
      name: "Creative Writing",
      description: "Stories, novels, characters, and imaginative prose",
      icon: BookOpen,
      color: "bg-purple-500",
      features: [
        "AI-powered story suggestions",
        "Character development assistance", 
        "Plot continuity checking",
        "Writing style analysis",
        "Real-time writing feedback"
      ],
      documentTypes: ["Story", "Character", "Plot", "Book Idea"]
    },
    {
      id: "legal", 
      name: "Legal Writing",
      description: "Contracts, briefs, memos, and legal documents",
      icon: Gavel,
      color: "bg-blue-500",
      features: [
        "Legal document templates",
        "Compliance checking",
        "Citation assistance",
        "Legal research integration",
        "Document review tools"
      ],
      documentTypes: ["Contract", "Legal Brief", "Memo", "Report"]
    }
  ]

  const handleSelectDomain = (domain) => {
    setSelectedDomain(domain)
  }

  const handleConfirm = () => {
    if (selectedDomain) {
      onSelectDomain(selectedDomain.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Stella.AI!</CardTitle>
          <CardDescription className="text-lg">
            Hi {user?.name || "there"}! Let's get you started by choosing your writing domain.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Select the type of writing you'd like to focus on. You can always switch between domains later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {domains.map((domain) => {
              const Icon = domain.icon
              const isSelected = selectedDomain?.id === domain.id
              
              return (
                <Card 
                  key={domain.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectDomain(domain)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${domain.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        <CardDescription>{domain.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {domain.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Document Types:</h4>
                      <div className="flex flex-wrap gap-1">
                        {domain.documentTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Skip for now
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedDomain}
              className="min-w-[120px]"
            >
              Continue with {selectedDomain?.name || "Domain"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
