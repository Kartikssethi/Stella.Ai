const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com'

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
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async createUser(userData) {
    return this.request('/create_user', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async startCreativeSession(userId) {
    return this.request('/start_creative_session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

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
}

export const writingApi = new WritingAPI()
