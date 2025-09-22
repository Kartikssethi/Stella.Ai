const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

class WritingAPI {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `API request failed: ${response.statusText} - ${errorText}`,
      )
    }

    return response.json()
  }

  // User Management
  async createUser(userData) {
    return this.request('/create_user', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`)
  }

  // Session Management
  async startCreativeSession(userId) {
    return this.request('/start_creative_session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

  async startLegalSession(userId) {
    return this.request('/start_session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

  // Document Management
  async createDocument(documentData) {
    return this.request('/create_document', {
      method: 'POST',
      body: JSON.stringify(documentData),
    })
  }

  async getUserDocuments(userId) {
    return this.request(`/users/${userId}/documents`)
  }

  async getDocument(docId) {
    return this.request(`/documents/${docId}`)
  }

  async updateDocument(docId, documentData) {
    return this.request(`/documents/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    })
  }

  // AI Writing Assistance
  async getAutoSuggestions(requestData) {
    return this.request('/auto_suggest', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getEnhancedAutoSuggestions(requestData) {
    return this.request('/enhanced_auto_suggest', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getLiveSuggestions(requestData) {
    return this.request('/live_suggestions', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getWritingAssist(requestData) {
    return this.request('/writing_assist', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async analyzeStory(requestData) {
    return this.request('/analyze_story', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getWritingFeedback(requestData) {
    return this.request('/writing_feedback', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async checkPlotContinuity(requestData) {
    return this.request('/plot_continuity_check', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  // System Information
  async getCreativeInfo() {
    return this.request('/creative_info')
  }

  async getSystemInfo() {
    return this.request('/system_info')
  }

  // Agent Tasks
  async getAgentTasks(documentId, taskType = null) {
    const endpoint = taskType
      ? `/agent_tasks/${documentId}?task_type=${taskType}`
      : `/agent_tasks/${documentId}`
    return this.request(endpoint)
  }

  async getContinuityHistory(documentId) {
    return this.request(`/agent_continuity_history/${documentId}`)
  }

  async getStoryTimeline(documentId) {
    return this.request(`/agent_story_timeline/${documentId}`)
  }

  async getStorySummary(documentId) {
    return this.request(`/agent_story_summary/${documentId}`)
  }

  // Check if user is new (has no documents)
  async isNewUser(userId) {
    try {
      const documents = await this.getUserDocuments(userId)
      return documents.length === 0
    } catch (error) {
      console.error('Error checking if user is new:', error)
      return true // Assume new user if error
    }
  }
}

export const writingApi = new WritingAPI()
