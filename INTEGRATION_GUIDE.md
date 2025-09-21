# Stella.AI Frontend-Backend Integration Guide

## Overview

This guide documents the integration between the frontend (Next.js) and backend (FastAPI) for the Stella.AI writing assistant application.

## Key Features Implemented

### 1. User Onboarding Flow
- **New User Detection**: Automatically detects if a user has no documents
- **Domain Selection**: Presents a dialog for users to choose between Creative and Legal writing
- **Session Management**: Creates appropriate sessions based on selected domain

### 2. Real-time Paragraph-level Suggestions
- **Click-to-Suggest**: Users can click on any paragraph to get AI suggestions
- **Debounced API Calls**: Prevents excessive API requests with 500ms debouncing
- **Context-aware Suggestions**: Uses document context and user history for better suggestions

### 3. Accept/Reject Suggestion System
- **Visual Overlay**: Suggestions appear in a floating overlay next to paragraphs
- **Multiple Actions**: Accept, Reject, or Apply suggestions directly
- **Confidence Scoring**: Shows AI confidence levels for each suggestion

## API Integration

### Backend Endpoints Used
- `POST /create_user` - Create new users
- `POST /start_creative_session` - Start creative writing session
- `POST /start_session` - Start legal writing session
- `POST /create_document` - Create new documents
- `GET /users/{user_id}/documents` - Get user's documents
- `POST /auto_suggest` - Get writing suggestions
- `POST /enhanced_auto_suggest` - Get enhanced suggestions with analysis
- `POST /writing_assist` - Get writing assistance
- `POST /analyze_story` - Analyze story content
- `POST /plot_continuity_check` - Check plot continuity

### Frontend Components

#### UserOnboardingDialog
- Displays domain selection options
- Shows features and document types for each domain
- Handles user selection and session creation

#### SuggestionOverlay
- Displays AI suggestions in a floating overlay
- Provides accept/reject/apply actions
- Shows confidence scores and suggestion types

#### EnhancedTipTapEditor
- Integrates with real-time suggestions hook
- Handles paragraph-level suggestion requests
- Manages suggestion state and user interactions

#### useRealtimeSuggestions Hook
- Manages suggestion fetching and caching
- Handles debouncing and error states
- Provides suggestion management functions

## Database Schema Alignment

The frontend database schema matches the backend requirements:

### User Table
- `id`, `name`, `email`, `created_at`, `updated_at`

### Document Table
- `id`, `title`, `type`, `description`, `created_by`, `created_at`, `updated_at`
- Supports both "creative" and "legal" document types

### Session Management
- Uses Better Auth for authentication
- Sessions are managed in-memory on backend
- User ID is passed to all API calls

## Environment Configuration

### Required Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Better Auth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage Flow

1. **User Login**: User authenticates via Better Auth
2. **New User Check**: System checks if user has existing documents
3. **Domain Selection**: New users choose between Creative and Legal writing
4. **Session Creation**: Appropriate session is created based on domain
5. **Document Management**: Users can create, edit, and manage documents
6. **Real-time Suggestions**: Click on paragraphs to get AI suggestions
7. **Suggestion Actions**: Accept, reject, or apply suggestions as needed

## Error Handling

- **API Fallbacks**: Falls back to localStorage if API calls fail
- **Graceful Degradation**: Continues to work even if some features fail
- **User Feedback**: Shows loading states and error messages
- **Retry Logic**: Automatic retry for failed requests

## Performance Optimizations

- **Debounced Requests**: Prevents excessive API calls
- **Request Cancellation**: Cancels previous requests when new ones are made
- **Local Caching**: Caches suggestions and document data
- **Lazy Loading**: Loads suggestions only when needed

## Testing

To test the integration:

1. Start the backend server: `cd Backend && python main.py`
2. Start the frontend server: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000`
4. Sign in with Google
5. Select a writing domain
6. Create a document and test the suggestion system

## Future Enhancements

- **Real-time Collaboration**: Multiple users editing the same document
- **Advanced Analytics**: Track writing patterns and improvements
- **Custom AI Models**: Domain-specific AI models for different writing types
- **Export Options**: Export documents in various formats
- **Version Control**: Track document changes and revisions
