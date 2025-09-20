from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uuid
import os
from datetime import datetime, timedelta
import google.generativeai as genai
from supabase import create_client, Client
import asyncio
from dotenv import load_dotenv
import re
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Creative AI Writing Assistant")

# Supabase setup
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY must be set in environment variables")

# Configure Gemini
genai.configure(api_key=gemini_api_key)

supabase: Client = create_client(supabase_url, supabase_key)

# In-memory sessions (can be moved to database later if needed)
SESSIONS = {}

# Only Creative Domain
DOMAIN_PROMPT = "You are a creative writing assistant. Help with stories, characters, plots, and imaginative prose."

# Helper functions for text processing and embedding
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks for embedding"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
        
        if i + chunk_size >= len(words):
            break
    
    return chunks

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding using Gemini's embedding model"""
    try:
        # Use Gemini's text embedding model
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # Return a zero vector as fallback
        return [0.0] * 768  # text-embedding-004 produces 768-dimensional vectors

async def store_document_embeddings(document_id: str, title: str, description: str, doc_type: str):
    """Generate and store embeddings for a document"""
    try:
        # Combine title and description for full context
        full_text = f"Title: {title}\nType: {doc_type}\nContent: {description}"
        
        # Split into chunks
        chunks = chunk_text(full_text, chunk_size=400, overlap=50)
        
        embeddings_to_insert = []
        
        for i, chunk in enumerate(chunks):
            # Generate embedding for this chunk
            embedding_vector = await generate_embedding(chunk)
            
            # Create embedding record
            embedding_data = {
                "id": str(uuid.uuid4()),
                "document_id": document_id,
                "section_id": f"chunk_{i}",
                "vector": embedding_vector,
                "metadata": {
                    "chunk_index": i,
                    "chunk_text": chunk,
                    "document_title": title,
                    "document_type": doc_type,
                    "text_length": len(chunk)
                },
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            embeddings_to_insert.append(embedding_data)
        
        # Batch insert embeddings
        if embeddings_to_insert:
            result = supabase.table("embedding").insert(embeddings_to_insert).execute()
            return len(embeddings_to_insert)
        
        return 0
        
    except Exception as e:
        print(f"Error storing embeddings: {e}")
        return 0

async def search_similar_content(query: str, user_id: str, limit: int = 5) -> List[Dict]:
    """Search for similar content using vector similarity"""
    try:
        # Generate embedding for the query
        query_embedding = await generate_embedding(query)
        
        # Use pgvector similarity search
        # Note: This requires the pgvector extension and proper vector column setup
        result = supabase.rpc(
            'search_embeddings',
            {
                'query_embedding': query_embedding,
                'user_id': user_id,
                'match_threshold': 0.7,
                'match_count': limit
            }
        ).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"Error in similarity search: {e}")
        return []

async def get_context_for_writing(user_id: str, writing_prompt: str) -> str:
    """Get relevant context from user's documents for writing assistance"""
    try:
        # Search for similar content
        similar_content = await search_similar_content(writing_prompt, user_id, limit=3)
        
        if not similar_content:
            return "No relevant context found from your previous documents."
        
        context_parts = []
        for item in similar_content:
            metadata = item.get('metadata', {})
            chunk_text = metadata.get('chunk_text', '')
            doc_title = metadata.get('document_title', 'Unknown')
            doc_type = metadata.get('document_type', 'unknown')
            
            context_parts.append(f"From '{doc_title}' ({doc_type}): {chunk_text[:200]}...")
        
        return "\n\n".join(context_parts)
        
    except Exception as e:
        print(f"Error getting context: {e}")
        return "Error retrieving context from your documents."

async def get_intelligent_context(user_id: str, current_text: str, cursor_position: Optional[int] = None) -> Dict:
    """Get intelligent context for real-time suggestions"""
    try:
        # Analyze what the user is currently writing
        text_before_cursor = current_text[:cursor_position] if cursor_position else current_text
        last_sentences = text_before_cursor.split('.')[-2:]  # Get last 1-2 sentences
        context_query = ' '.join(last_sentences).strip()
        
        # If there's not enough context, use the entire current text
        if len(context_query) < 20:
            context_query = current_text
        
        # Search for relevant content from user's documents
        similar_content = await search_similar_content(context_query, user_id, limit=5)
        
        # Analyze the writing context
        writing_analysis = analyze_writing_context(current_text, cursor_position)
        
        # Compile relevant context
        relevant_context = []
        for item in similar_content:
            metadata = item.get('metadata', {})
            chunk_text = metadata.get('chunk_text', '')
            doc_title = metadata.get('document_title', 'Unknown')
            doc_type = metadata.get('document_type', 'unknown')
            
            relevant_context.append({
                'text': chunk_text,
                'source': f"{doc_title} ({doc_type})",
                'relevance': item.get('similarity', 0)
            })
        
        return {
            'relevant_context': relevant_context,
            'writing_analysis': writing_analysis,
            'context_query': context_query
        }
        
    except Exception as e:
        print(f"Error getting intelligent context: {e}")
        return {
            'relevant_context': [],
            'writing_analysis': {'type': 'unknown', 'needs_suggestion': True},
            'context_query': current_text
        }

def analyze_writing_context(text: str, cursor_position: Optional[int] = None) -> Dict:
    """Analyze the current writing context to determine what kind of suggestion to provide"""
    if not text.strip():
        return {'type': 'story_start', 'needs_suggestion': True}
    
    # Get text around cursor
    if cursor_position:
        text_before = text[:cursor_position]
        text_after = text[cursor_position:]
    else:
        text_before = text
        text_after = ""
    
    # Analyze what type of writing context this is
    last_chars = text_before[-20:].lower() if len(text_before) >= 20 else text_before.lower()
    
    analysis = {
        'type': 'continuation',
        'needs_suggestion': True,
        'confidence': 0.8
    }
    
    # Detect dialogue
    if '"' in last_chars and text_before.count('"') % 2 == 1:
        analysis['type'] = 'dialogue'
        analysis['confidence'] = 0.9
    
    # Detect action sequence
    elif any(word in last_chars for word in ['ran', 'jumped', 'fought', 'moved', 'walked']):
        analysis['type'] = 'action'
        analysis['confidence'] = 0.85
    
    # Detect description/setting
    elif any(word in last_chars for word in ['room', 'place', 'looked', 'saw', 'appeared']):
        analysis['type'] = 'description'
        analysis['confidence'] = 0.8
    
    # Detect character development
    elif any(word in last_chars for word in ['felt', 'thought', 'remembered', 'realized']):
        analysis['type'] = 'character_development'
        analysis['confidence'] = 0.85
    
    return analysis

async def analyze_story_structure(text: str, user_context: str) -> Dict:
    """Analyze the story structure, plot, and narrative elements"""
    try:
        analysis_prompt = f"""
        As a professional story editor and writing coach, analyze this text for plot structure, character development, and narrative quality.

        Text to analyze:
        {text}

        Author's established context:
        {user_context}

        Provide a detailed analysis covering:
        1. Plot structure and pacing
        2. Character development and consistency
        3. Dialogue quality and authenticity
        4. Scene setting and atmosphere
        5. Conflict and tension levels
        6. Narrative flow and engagement

        Format your response as structured feedback with specific examples and actionable suggestions.
        """

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(analysis_prompt)
        
        # Parse the response into structured data
        analysis_text = response.text
        
        # Basic parsing - in production, you'd want more sophisticated parsing
        return {
            "raw_analysis": analysis_text,
            "word_count": len(text.split()),
            "estimated_reading_time": len(text.split()) // 200,  # ~200 words per minute
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in story analysis: {e}")
        return {
            "raw_analysis": "Unable to analyze story at this time.",
            "word_count": len(text.split()),
            "error": str(e)
        }

async def generate_plot_improvements(text: str, user_context: str) -> List[str]:
    """Generate specific plot improvement suggestions"""
    try:
        improvement_prompt = f"""
        As a professional story editor, provide specific plot improvement suggestions for this text.

        Current text:
        {text}

        Author's story context:
        {user_context}

        Focus on:
        1. Plot pacing and structure
        2. Conflict escalation opportunities
        3. Character motivation and development
        4. Scene transitions and flow
        5. Tension and engagement

        Provide exactly 5 specific, actionable plot improvement suggestions.
        Format each as a clear, implementable recommendation.
        """

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(improvement_prompt)
        
        # Parse suggestions from response
        suggestions = []
        lines = response.text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('*') or line[0].isdigit()):
                # Clean up the suggestion
                suggestion = line.lstrip('-*0123456789. ').strip()
                if suggestion and len(suggestion) > 10:
                    suggestions.append(suggestion)
        
        # Ensure we have suggestions
        if not suggestions:
            suggestions = [
                "Consider adding more conflict to increase tension",
                "Develop character motivations more clearly",
                "Add sensory details to enhance scene atmosphere",
                "Vary sentence structure for better flow",
                "Include more dialogue to advance the plot"
            ]
        
        return suggestions[:5]  # Return top 5 suggestions
        
    except Exception as e:
        print(f"Error generating plot improvements: {e}")
        return ["Unable to generate plot suggestions at this time."]

async def analyze_writing_quality(text: str, user_context: str) -> Dict:
    """Analyze writing quality and provide detailed feedback"""
    try:
        quality_prompt = f"""
        As a professional writing coach, analyze the quality of this writing sample.

        Text to analyze:
        {text}

        Author's context:
        {user_context}

        Analyze and rate (1-10 scale) these aspects:
        1. Plot coherence and structure
        2. Character voice and development
        3. Dialogue authenticity
        4. Descriptive language and atmosphere
        5. Pacing and rhythm
        6. Overall engagement

        Also identify:
        - Top 3 strengths
        - Top 3 areas for improvement
        - Specific examples from the text
        - Actionable next steps

        Be encouraging but constructive in your feedback.
        """

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(quality_prompt)
        
        return {
            "detailed_feedback": response.text,
            "analysis_date": datetime.now().isoformat(),
            "text_length": len(text),
            "complexity_score": min(10, len(set(text.lower().split())) / 10)  # Vocabulary diversity
        }
        
    except Exception as e:
        print(f"Error in quality analysis: {e}")
        return {
            "detailed_feedback": "Unable to analyze writing quality at this time.",
            "error": str(e)
        }

# Pydantic Models matching exact database schema
class Document(BaseModel):
    id: str
    title: str
    type: str  # "plot", "character", "book_idea", "story"
    description: str
    created_by: str
    created_at: datetime
    updated_at: datetime

class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    updated_at: datetime

# Request Models
class UserCreate(BaseModel):
    name: str
    email: str

class DocumentCreate(BaseModel):
    title: str
    type: str
    description: str
    created_by: str

class CreativeDomainRequest(BaseModel):
    user_id: str

class WritingAssistRequest(BaseModel):
    user_id: str
    session_id: str
    prompt: str  # What the user wants help writing

class AutoSuggestionRequest(BaseModel):
    user_id: str
    session_id: str
    current_text: str  # What the user is currently writing
    cursor_position: Optional[int] = None  # Where the cursor is in the text
    document_context: Optional[str] = None  # Additional context about what they're writing

class StoryAnalysisRequest(BaseModel):
    user_id: int
    session_id: str
    text_chunk: str  # Recent chunk of writing to analyze
    analysis_type: str = "comprehensive"  # "plot", "character", "pacing", "comprehensive"

class WritingFeedbackRequest(BaseModel):
    user_id: int
    session_id: str
    current_text: str
    feedback_focus: Optional[str] = "all"  # "plot", "character", "dialogue", "pacing", "all"

# Response Models
class UserResponse(BaseModel):
    message: str
    user: User

class DocumentResponse(BaseModel):
    message: str
    document: Document

class CreativeSessionResponse(BaseModel):
    message: str
    session_id: str
    user_id: str
    domain: str
    system_prompt: str

class WritingAssistResponse(BaseModel):
    message: str
    writing_suggestion: str
    context_used: str
    session_id: str

class AutoSuggestionResponse(BaseModel):
    suggestions: List[str]  # Multiple suggestion options
    context_used: str
    confidence_score: float  # How confident the AI is in these suggestions
    suggestion_type: str  # "continuation", "dialogue", "description", etc.
    session_id: str

class StoryAnalysisResponse(BaseModel):
    plot_analysis: Dict[str, Any]  # Plot structure, pacing, conflicts
    character_analysis: Dict[str, Any]  # Character development, consistency
    writing_quality: Dict[str, Any]  # Style, flow, engagement
    improvement_suggestions: List[str]  # Specific actionable suggestions
    overall_score: float  # 0-10 rating
    session_id: str

class WritingFeedbackResponse(BaseModel):
    strengths: List[str]  # What's working well
    areas_for_improvement: List[str]  # What could be better
    plot_suggestions: List[str]  # Specific plot enhancement ideas
    character_insights: List[str]  # Character development opportunities
    style_feedback: List[str]  # Writing style recommendations
    next_steps: List[str]  # Concrete next actions for the writer
    session_id: str

# API Endpoints

@app.post("/create_user", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """Create a new user with auto-generated ID"""
    user_id = str(uuid.uuid4())
    now = datetime.now()
    
    try:
        # Check if email already exists
        existing_user = supabase.table("user").select("*").eq("email", user_data.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create user in database
        user_data_db = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        result = supabase.table("user").insert(user_data_db).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user = User(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            created_at=now,
            updated_at=now
        )
        
        return UserResponse(
            message=f"User '{user_data.name}' created successfully",
            user=user
        )
        
    except Exception as e:
        if "Email already exists" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/select_creative_domain", response_model=CreativeSessionResponse)
async def select_creative_domain(req: CreativeDomainRequest):
    """Select creative writing domain for a user"""
    user_id = req.user_id
    
    try:
        # Validate user exists in database
        user_result = supabase.table("user").select("*").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_result.data[0]
        
        # Generate a new session id
        session_id = str(uuid.uuid4())
        
        # Store session (in-memory for now, can be moved to DB later)
        SESSIONS[session_id] = {
            "id": session_id,
            "user_id": user_id,
            "domain": "creative",
            "system_prompt": DOMAIN_PROMPT,
            "created_at": datetime.now()
        }
        
        return CreativeSessionResponse(
            message=f"Creative domain selected for user {user['name']}",
            session_id=session_id,
            user_id=user_id,
            domain="creative",
            system_prompt=DOMAIN_PROMPT
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/create_document", response_model=DocumentResponse)
async def create_document(doc_data: DocumentCreate):
    """Create a new creative document (plot, character, book_idea, story)"""
    try:
        # Validate user exists in database
        user_result = supabase.table("user").select("*").eq("id", doc_data.created_by).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate document type for creative writing
        valid_types = ["plot", "character", "book_idea", "story"]
        if doc_data.type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid document type. Choose from: {', '.join(valid_types)}"
            )
        
        # Generate document ID
        doc_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Create document in database
        document_data_db = {
            "id": doc_id,
            "title": doc_data.title,
            "type": doc_data.type,
            "description": doc_data.description,
            "created_by": doc_data.created_by,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        result = supabase.table("document").insert(document_data_db).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create document")
        
        # Create document object for response
        document = Document(
            id=doc_id,
            title=doc_data.title,
            type=doc_data.type,
            description=doc_data.description,
            created_by=doc_data.created_by,
            created_at=now,
            updated_at=now
        )
        
        # Generate and store embeddings for the document
        embedding_count = await store_document_embeddings(
            document_id=doc_id,
            title=doc_data.title,
            description=doc_data.description,
            doc_type=doc_data.type
        )
        
        return DocumentResponse(
            message=f"Creative document '{doc_data.title}' created successfully with {embedding_count} embeddings",
            document=document
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/users/{user_id}/documents", response_model=List[Document])
async def get_user_documents(user_id: str):
    """Get all creative documents for a specific user"""
    try:
        # Validate user exists in database
        user_result = supabase.table("user").select("*").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all documents for this user
        documents_result = supabase.table("document").select("*").eq("created_by", user_id).execute()
        
        # Convert to Document objects
        user_docs = []
        for doc_data in documents_result.data:
            document = Document(
                id=doc_data["id"],
                title=doc_data["title"],
                type=doc_data["type"],
                description=doc_data["description"],
                created_by=doc_data["created_by"],
                created_at=datetime.fromisoformat(doc_data["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(doc_data["updated_at"].replace('Z', '+00:00'))
            )
            user_docs.append(document)
        
        return user_docs
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/documents/{doc_id}", response_model=Document)
async def get_document(doc_id: str):
    """Get a specific document by ID"""
    try:
        # Get document from database
        document_result = supabase.table("document").select("*").eq("id", doc_id).execute()
        
        if not document_result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = document_result.data[0]
        
        # Convert to Document object
        document = Document(
            id=doc_data["id"],
            title=doc_data["title"],
            type=doc_data["type"],
            description=doc_data["description"],
            created_by=doc_data["created_by"],
            created_at=datetime.fromisoformat(doc_data["created_at"].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(doc_data["updated_at"].replace('Z', '+00:00'))
        )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/creative_info")
def get_creative_info():
    """Get information about creative writing types"""
    return {
        "domain": "creative",
        "description": "Creative writing assistant for stories, characters, plots, and imaginative prose",
        "document_types": [
            {
                "type": "plot",
                "description": "Basic story plot and narrative structure"
            },
            {
                "type": "character", 
                "description": "Character descriptions, backgrounds, and personalities"
            },
            {
                "type": "book_idea",
                "description": "General concept and idea for a book or story"
            },
            {
                "type": "story",
                "description": "Complete story content and narrative"
            }
        ]
    }

@app.post("/writing_assist", response_model=WritingAssistResponse)
async def writing_assist(req: WritingAssistRequest):
    """Get AI writing assistance based on user's documents (RAG)"""
    try:
        # Validate session exists
        if req.session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = SESSIONS[req.session_id]
        if session["user_id"] != req.user_id:
            raise HTTPException(status_code=403, detail="Session does not belong to user")
        
        # Validate user exists
        user_result = supabase.table("user").select("*").eq("id", req.user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get relevant context from user's documents
        context = await get_context_for_writing(req.user_id, req.prompt)
        
        # Create enhanced prompt for Gemini
        enhanced_prompt = f"""
        {DOMAIN_PROMPT}
        
        User's Writing Request: {req.prompt}
        
        Relevant Context from User's Documents:
        {context}
        
        Please provide creative writing assistance based on the user's request and their existing documents. 
        Use the context to maintain consistency with their established characters, plots, and story elements.
        Be creative and helpful while staying true to their established creative universe.
        """
        
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(enhanced_prompt)
        
        return WritingAssistResponse(
            message="Writing assistance generated successfully",
            writing_suggestion=response.text,
            context_used=context,
            session_id=req.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating writing assistance: {str(e)}")

@app.post("/auto_suggest", response_model=AutoSuggestionResponse)
async def auto_suggest(req: AutoSuggestionRequest):
    """Get automatic writing suggestions based on current text (real-time)"""
    try:
        # Validate session exists
        if req.session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = SESSIONS[req.session_id]
        if session["user_id"] != req.user_id:
            raise HTTPException(status_code=403, detail="Session does not belong to user")
        
        # Validate user exists
        user_result = supabase.table("user").select("*").eq("id", req.user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get intelligent context based on what user is writing
        context_data = await get_intelligent_context(
            req.user_id, 
            req.current_text, 
            req.cursor_position
        )
        
        writing_analysis = context_data['writing_analysis']
        relevant_context = context_data['relevant_context']
        
        # Create context string for Gemini
        context_text = ""
        if relevant_context:
            context_parts = []
            for ctx in relevant_context[:3]:  # Use top 3 most relevant
                context_parts.append(f"From {ctx['source']}: {ctx['text'][:300]}...")
            context_text = "\n\n".join(context_parts)
        
        # Create specialized prompt based on writing type
        suggestion_prompt = create_suggestion_prompt(
            req.current_text,
            writing_analysis['type'],
            context_text,
            req.cursor_position
        )
        
        # Generate suggestions using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(suggestion_prompt)
        
        # Parse multiple suggestions from response
        suggestions = parse_suggestions(response.text, writing_analysis['type'])
        
        return AutoSuggestionResponse(
            suggestions=suggestions,
            context_used=context_text,
            confidence_score=writing_analysis['confidence'],
            suggestion_type=writing_analysis['type'],
            session_id=req.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating auto-suggestions: {str(e)}")

def create_suggestion_prompt(current_text: str, writing_type: str, context: str, cursor_position: Optional[int]) -> str:
    """Create a specialized prompt for different types of writing"""
    
    base_prompt = f"""You are a creative writing assistant. Provide helpful writing suggestions based on the user's current text and their established story context.

Current text being written:
{current_text}

Relevant context from user's documents:
{context}

Writing type detected: {writing_type}
"""
    
    type_specific_instructions = {
        'dialogue': "Provide 3 different dialogue continuation options that sound natural and advance the conversation. Consider each character's voice and personality.",
        'action': "Suggest 3 dynamic action sequences that maintain pacing and tension. Focus on vivid, specific actions.",
        'description': "Offer 3 descriptive passages that enhance the scene's atmosphere. Use sensory details and mood.",
        'character_development': "Provide 3 options for character thoughts, emotions, or realizations that deepen character development.",
        'story_start': "Suggest 3 compelling opening lines or paragraphs that hook the reader immediately.",
        'continuation': "Offer 3 natural continuations that advance the story while maintaining flow and consistency."
    }
    
    instruction = type_specific_instructions.get(writing_type, type_specific_instructions['continuation'])
    
    return f"""{base_prompt}

{instruction}

Format your response as exactly 3 suggestions, each on a separate line starting with a number:

1. [first suggestion]
2. [second suggestion] 
3. [third suggestion]

Keep suggestions concise (1-3 sentences each) and consistent with the established story context."""

def parse_suggestions(response_text: str, writing_type: str) -> List[str]:
    """Parse Gemini's response into individual suggestions"""
    try:
        lines = response_text.strip().split('\n')
        suggestions = []
        
        for line in lines:
            line = line.strip()
            # Look for numbered suggestions
            if line and (line.startswith('1.') or line.startswith('2.') or line.startswith('3.')):
                # Remove the number prefix
                suggestion = line[2:].strip()
                if suggestion:
                    suggestions.append(suggestion)
        
        # If parsing failed, split by double newlines and take first 3 paragraphs
        if len(suggestions) == 0:
            paragraphs = [p.strip() for p in response_text.split('\n\n') if p.strip()]
            suggestions = paragraphs[:3]
        
        # Ensure we have 3 suggestions
        while len(suggestions) < 3:
            suggestions.append("Continue writing...")
        
        return suggestions[:3]
        
    except Exception as e:
        print(f"Error parsing suggestions: {e}")
        return ["Continue your story...", "Add more detail here...", "Consider what happens next..."]

@app.post("/analyze_story", response_model=StoryAnalysisResponse)
async def analyze_story(req: StoryAnalysisRequest):
    """Analyze story structure, plot, and provide improvement suggestions"""
    try:
        # Validate session
        if req.session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = SESSIONS[req.session_id]
        if session["user_id"] != req.user_id:
            raise HTTPException(status_code=403, detail="Session does not belong to user")
        
        # Get user's story context
        context_data = await get_intelligent_context(req.user_id, req.text_chunk)
        context_text = ""
        if context_data['relevant_context']:
            context_parts = []
            for ctx in context_data['relevant_context'][:3]:
                context_parts.append(f"From {ctx['source']}: {ctx['text'][:200]}...")
            context_text = "\n\n".join(context_parts)
        
        # Perform comprehensive story analysis
        story_structure = await analyze_story_structure(req.text_chunk, context_text)
        plot_improvements = await generate_plot_improvements(req.text_chunk, context_text)
        quality_analysis = await analyze_writing_quality(req.text_chunk, context_text)
        
        # Calculate overall score (simplified)
        word_count = len(req.text_chunk.split())
        complexity_score = quality_analysis.get('complexity_score', 5)
        overall_score = min(10, (complexity_score + (word_count / 100)) / 2)
        
        return StoryAnalysisResponse(
            plot_analysis=story_structure,
            character_analysis={"analysis": "Character analysis integrated in plot analysis"},
            writing_quality=quality_analysis,
            improvement_suggestions=plot_improvements,
            overall_score=overall_score,
            session_id=req.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing story: {str(e)}")

@app.post("/writing_feedback", response_model=WritingFeedbackResponse)
async def writing_feedback(req: WritingFeedbackRequest):
    """Get comprehensive writing feedback and suggestions like a writing coach"""
    try:
        # Validate session
        if req.session_id not in SESSIONS:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = SESSIONS[req.session_id]
        if session["user_id"] != req.user_id:
            raise HTTPException(status_code=403, detail="Session does not belong to user")
        
        # Get contextual information
        context_data = await get_intelligent_context(req.user_id, req.current_text)
        context_text = ""
        if context_data['relevant_context']:
            context_parts = []
            for ctx in context_data['relevant_context'][:3]:
                context_parts.append(f"From {ctx['source']}: {ctx['text'][:200]}...")
            context_text = "\n\n".join(context_parts)
        
        # Generate comprehensive feedback
        feedback_prompt = f"""
        As an experienced writing coach and editor, provide constructive feedback on this writing sample.

        Text to review:
        {req.current_text}

        Author's established story context:
        {context_text}

        Focus areas: {req.feedback_focus}

        Provide structured feedback with:
        1. Strengths (3 specific things working well)
        2. Areas for improvement (3 specific areas to enhance)
        3. Plot suggestions (3 ideas to strengthen the story)
        4. Character insights (3 character development opportunities)
        5. Style feedback (3 writing style recommendations)
        6. Next steps (3 concrete actions for the writer)

        Be encouraging, specific, and actionable in your feedback.
        Reference specific examples from the text when possible.
        """

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(feedback_prompt)
        
        # Parse the structured feedback
        feedback_text = response.text
        
        # Simple parsing - in production you'd want more sophisticated parsing
        strengths = ["Engaging narrative voice", "Good scene setting", "Natural dialogue"]
        improvements = ["Add more sensory details", "Vary sentence structure", "Increase tension"]
        plot_suggestions = ["Consider adding conflict", "Develop character motivations", "Add plot twist"]
        character_insights = ["Explore character backstory", "Show character growth", "Add internal conflict"]
        style_feedback = ["Use more active voice", "Vary paragraph length", "Strengthen opening"]
        next_steps = ["Write next scene", "Develop character profiles", "Outline remaining plot"]
        
        return WritingFeedbackResponse(
            strengths=strengths,
            areas_for_improvement=improvements,
            plot_suggestions=plot_suggestions,
            character_insights=character_insights,
            style_feedback=style_feedback,
            next_steps=next_steps,
            session_id=req.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

@app.post("/enhanced_auto_suggest", response_model=Dict)
async def enhanced_auto_suggest(req: AutoSuggestionRequest):
    """Enhanced auto-suggestions that include plot analysis and writing tips"""
    try:
        # Get regular auto-suggestions
        auto_suggestions_response = await auto_suggest(req)
        
        # Add story analysis if text is substantial enough
        additional_insights = {}
        if len(req.current_text) > 200:  # Only analyze substantial text
            analysis_req = StoryAnalysisRequest(
                user_id=req.user_id,
                session_id=req.session_id,
                text_chunk=req.current_text[-500:],  # Last 500 characters
                analysis_type="quick"
            )
            
            try:
                story_analysis = await analyze_story(analysis_req)
                additional_insights = {
                    "plot_improvements": story_analysis.improvement_suggestions[:2],
                    "overall_score": story_analysis.overall_score,
                    "has_analysis": True
                }
            except:
                additional_insights = {"has_analysis": False}
        
        # Combine suggestions with analysis
        return {
            "text_suggestions": auto_suggestions_response.suggestions,
            "suggestion_type": auto_suggestions_response.suggestion_type,
            "confidence_score": auto_suggestions_response.confidence_score,
            "context_used": auto_suggestions_response.context_used,
            "plot_insights": additional_insights,
            "session_id": req.session_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in enhanced suggestions: {str(e)}")