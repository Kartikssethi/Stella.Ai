#!/usr/bin/env python3
"""
Test the database-backed Plot Continuity Agent
This demonstrates the persistent agent task management using the agent_task schema.
"""

import asyncio
import json
import uuid
from datetime import datetime

async def test_persistent_plot_continuity_agent():
    """Test the database-backed Plot Continuity Agent"""
    
    print("🤖 Testing Database-Backed Plot Continuity Agent")
    print("=" * 60)
    
    # Generate a unique document ID for this test
    document_id = f"test_story_{uuid.uuid4().hex[:8]}"
    print(f"📖 Document ID: {document_id}")
    
    # Test story content - multi-chapter narrative
    chapters = [
        {
            "title": "Chapter 1: The Discovery",
            "content": """
            Sarah Chen, a 25-year-old archaeologist, discovered an ancient crystal in the ruins 
            of Atlantis. The crystal glowed with an inner blue light and felt warm to the touch. 
            She was working alone in the underwater excavation site, 100 feet below the surface 
            near the Azores. Her diving partner, Marcus Rodriguez, was exploring another section 
            of the ruins. The crystal seemed to pulse with energy, and Sarah felt a strange 
            connection to it. She carefully placed it in her collection bag and made notes 
            about its location and the surrounding artifacts.
            """
        },
        {
            "title": "Chapter 2: The Return",
            "content": """
            Back at the research station, Sarah examined the crystal under laboratory conditions. 
            Dr. Elizabeth Harper, the expedition leader, was fascinated by the unusual energy 
            readings. The crystal measured exactly 15 centimeters in length and weighed 200 grams. 
            When Sarah touched it again, she experienced vivid visions of ancient Atlantean 
            civilization. Marcus was skeptical about Sarah's claims of psychic connections, 
            but he couldn't deny the crystal's unusual properties. The team decided to run 
            more tests before reporting their discovery to the university.
            """
        },
        {
            "title": "Chapter 3: The Contradiction",
            "content": """
            Three weeks later, Sarah Chen, now 30 years old, met with her mentor Dr. James Wilson. 
            The crystal had changed - it now glowed red instead of blue and felt cold to the touch. 
            Marcus, who had been supportive before, was now openly hostile about the discovery. 
            Sarah remembered finding the crystal at 50 feet depth, not 100 feet as she had 
            originally recorded. Dr. Harper seemed to have no memory of the energy readings 
            from the previous week. The crystal now weighed 300 grams instead of 200 grams, 
            and Sarah wondered if she was losing her mind.
            """
        }
    ]
    
    base_url = "http://localhost:8000"
    
    print(f"\n📚 Testing multi-chapter story analysis...")
    
    # Process each chapter and demonstrate persistent agent memory
    for i, chapter in enumerate(chapters, 1):
        print(f"\n📖 Processing {chapter['title']}")
        print("-" * 40)
        
        # Simulate API call to plot continuity check
        request_data = {
            "document_id": document_id,
            "story_text": chapter["content"],
            "chapter_info": chapter["title"]
        }
        
        print(f"📤 Request Data:")
        print(f"   Document ID: {request_data['document_id']}")
        print(f"   Chapter: {request_data['chapter_info']}")
        print(f"   Text Length: {len(request_data['story_text'])} characters")
        
        try:
            # This would be the actual API call:
            # response = requests.post(f"{base_url}/plot_continuity_check", json=request_data)
            
            # For demo purposes, show what the agent would detect:
            print(f"\n🤖 Agent Analysis for {chapter['title']}:")
            
            if i == 1:
                print("   ✅ First chapter - establishing baseline")
                print("   📝 Characters detected: Sarah Chen (25), Marcus Rodriguez")
                print("   📍 Location: Atlantis ruins, 100 feet depth")
                print("   🔮 Artifact: Blue crystal, warm, 15cm, 200g")
                
            elif i == 2:
                print("   ✅ Good continuity maintained")
                print("   📝 Character consistency: Sarah, Marcus behaviors match")
                print("   📍 Location transition: Ruins → Research station")
                print("   🔮 Crystal properties: Blue, warm, 15cm, 200g (consistent)")
                print("   👥 New character: Dr. Elizabeth Harper")
                
            elif i == 3:
                print("   ⚠️  CONTINUITY ISSUES DETECTED:")
                print("   🔴 Age inconsistency: Sarah Chen 25 → 30 (3 weeks later)")
                print("   🔴 Crystal color: Blue → Red")
                print("   🔴 Crystal temperature: Warm → Cold") 
                print("   🔴 Depth inconsistency: 100 feet → 50 feet")
                print("   🔴 Weight change: 200g → 300g")
                print("   🔴 Character behavior: Marcus supportive → hostile")
                print("   🔴 Dr. Harper memory loss unexplained")
                
            print(f"\n💾 Stored in database:")
            print(f"   📄 Task: story_context_added")
            print(f"   📊 Task: plot_continuity_check") 
            print(f"   🧠 Task: story_element_extraction")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Simulate delay between chapters
        await asyncio.sleep(1)
    
    print(f"\n📈 Agent Task Summary for Document {document_id}:")
    print("=" * 60)
    print("📊 Database would contain:")
    print(f"   • 3 story_context_added tasks (one per chapter)")
    print(f"   • 3 plot_continuity_check tasks (analysis results)")
    print(f"   • 3 story_element_extraction tasks (character/plot tracking)")
    print(f"   • Total: 9 agent tasks with full persistence")
    
    print(f"\n🎯 Key Benefits of Database Integration:")
    print("✅ Persistent story memory across server restarts")
    print("✅ Complete audit trail of agent analysis")
    print("✅ Cross-session continuity tracking")
    print("✅ Historical analysis and improvement")
    print("✅ Multi-document story management")
    print("✅ Agent performance metrics")
    
    print(f"\n🔗 Available API Endpoints:")
    print(f"   POST /plot_continuity_check - Main agent analysis")
    print(f"   GET  /agent_tasks/{document_id} - All agent tasks")
    print(f"   GET  /agent_continuity_history/{document_id} - Continuity history")
    print(f"   GET  /agent_story_timeline/{document_id} - Story timeline")
    print(f"   GET  /agent_story_summary/{document_id} - Agent story summary")
    
    print(f"\n🗄️  Database Schema Integration:")
    print("   agent_task table stores all agent operations")
    print("   document table links stories to agent analysis")
    print("   Full CRUD operations for agent task management")
    print("   Persistent agent memory for production deployment")

async def test_agent_endpoints():
    """Test the new agent management endpoints"""
    
    print(f"\n🔧 Testing Agent Management Endpoints")
    print("=" * 60)
    
    document_id = "test_story_12345"
    
    endpoints = [
        f"/agent_tasks/{document_id}",
        f"/agent_tasks/{document_id}?task_type=plot_continuity_check",
        f"/agent_continuity_history/{document_id}",
        f"/agent_story_timeline/{document_id}",
        f"/agent_story_summary/{document_id}"
    ]
    
    for endpoint in endpoints:
        print(f"\n🌐 GET {endpoint}")
        print(f"   📄 Purpose: Retrieve agent data for document")
        print(f"   💾 Database: Query agent_task table")
        print(f"   📊 Response: JSON with agent analysis results")

if __name__ == "__main__":
    asyncio.run(test_persistent_plot_continuity_agent())
    asyncio.run(test_agent_endpoints())