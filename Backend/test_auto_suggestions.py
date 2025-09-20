#!/usr/bin/env python3
"""
Test script for Real-Time Auto-Suggestions (GitHub Copilot style)
Simulates how the frontend would call the auto-suggestion API
"""
import asyncio
import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000"

async def test_auto_suggestions():
    async with httpx.AsyncClient() as client:
        print("🚀 Testing Real-Time Auto-Suggestion System")
        print("🎯 Like GitHub Copilot, but for Creative Writing!")
        print("=" * 70)
        
        # Step 1: Setup user and session
        print("1. Setting up user and creative session...")
        
        # Create user
        user_data = {"name": "Alex Writer", "email": "alex@writer.com"}
        user_response = await client.post(f"{BASE_URL}/create_user", json=user_data)
        user_id = user_response.json()["user"]["id"]
        
        # Select creative domain
        domain_data = {"user_id": user_id}
        session_response = await client.post(f"{BASE_URL}/select_creative_domain", json=domain_data)
        session_id = session_response.json()["session_id"]
        
        print(f"✅ User: {user_id[:8]}... | Session: {session_id[:8]}...")
        
        # Step 2: Create some context documents
        print("\n2. Creating story context for AI suggestions...")
        
        # Character document
        character_doc = {
            "title": "Luna - Space Archaeologist",
            "type": "character",
            "description": "Luna Martinez, 32, is a brilliant space archaeologist who specializes in ancient alien civilizations. She has dark curly hair, keen brown eyes, and a scar on her left hand from a laser accident. Personality: Curious, methodical, slightly reckless when she finds something interesting. She talks to herself when thinking. Background: Grew up on Mars colonies, lost her parents in a mining accident. Has a pet AI named Chip that lives in her datapad.",
            "created_by": user_id
        }
        
        plot_doc = {
            "title": "The Nexus Discovery",
            "type": "plot", 
            "description": "Luna discovers an ancient alien nexus on the asteroid Vesta-7. The nexus appears to be a galactic communication hub that's been dormant for millennia. When she accidentally activates it, she receives a distress signal from across the galaxy. The signal reveals that an ancient enemy called 'The Void' is returning. Luna must decide whether to investigate alone or alert the Solar Federation, knowing that either choice could doom humanity or save it.",
            "created_by": user_id
        }
        
        for doc in [character_doc, plot_doc]:
            await client.post(f"{BASE_URL}/create_document", json=doc)
        
        print("✅ Created character profile and plot outline")
        print("⏳ Waiting for embeddings to be generated...")
        await asyncio.sleep(3)  # Wait for embeddings
        
        # Step 3: Simulate real-time writing with auto-suggestions
        print("\n3. 🎬 Simulating Real-Time Writing Session...")
        print("   (This is how your frontend would work)")
        print()
        
        # Simulate a user typing progressively
        writing_session = [
            "Luna stepped into the ancient chamber, her breath visible in the cold air.",
            "Luna stepped into the ancient chamber, her breath visible in the cold air. The walls were covered in strange symbols that seemed to",
            "Luna stepped into the ancient chamber, her breath visible in the cold air. The walls were covered in strange symbols that seemed to pulse with a faint blue light. She pulled out her scanner and",
            "Luna stepped into the ancient chamber, her breath visible in the cold air. The walls were covered in strange symbols that seemed to pulse with a faint blue light. She pulled out her scanner and began recording the markings. 'Chip,' she whispered to her AI companion,",
            'Luna stepped into the ancient chamber, her breath visible in the cold air. The walls were covered in strange symbols that seemed to pulse with a faint blue light. She pulled out her scanner and began recording the markings. "Chip," she whispered to her AI companion, "are you seeing this? These symbols match the ones from'
        ]
        
        for i, current_text in enumerate(writing_session):
            print(f"\n📝 Writing Stage {i+1}:")
            print(f"   Current text: {current_text}")
            print("   ⏱️  User stops typing for 2 seconds...")
            
            # Simulate the 2-second delay
            await asyncio.sleep(0.5)  # Shortened for demo
            
            # Make auto-suggestion request
            suggestion_request = {
                "user_id": user_id,
                "session_id": session_id,
                "current_text": current_text,
                "cursor_position": len(current_text)
            }
            
            try:
                print("   🤖 Generating AI suggestions...")
                suggestion_response = await client.post(
                    f"{BASE_URL}/auto_suggest", 
                    json=suggestion_request,
                    timeout=30.0
                )
                
                if suggestion_response.status_code == 200:
                    suggestions = suggestion_response.json()
                    print(f"   ✅ AI Analysis: {suggestions['suggestion_type']} (confidence: {suggestions['confidence_score']:.1f})")
                    print("   💡 Auto-Suggestions:")
                    
                    for j, suggestion in enumerate(suggestions['suggestions'], 1):
                        print(f"      {j}. {suggestion}")
                    
                    if suggestions['context_used']:
                        print(f"   📚 Used context from: {len(suggestions['context_used'])} chars")
                else:
                    print(f"   ❌ Error: {suggestion_response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Error getting suggestions: {e}")
            
            print("   " + "-" * 50)
        
        # Step 4: Test different writing contexts
        print("\n4. 🎭 Testing Different Writing Contexts...")
        
        test_scenarios = [
            {
                "name": "Dialogue Start",
                "text": 'Luna turned to Marcus and said, "',
                "expected_type": "dialogue"
            },
            {
                "name": "Action Sequence", 
                "text": "The alarm blared as Luna ran toward the escape pod. She jumped over the fallen debris and",
                "expected_type": "action"
            },
            {
                "name": "Character Emotion",
                "text": "Luna stared at the alien artifact, her heart racing. She felt a mixture of fear and excitement as she realized",
                "expected_type": "character_development"
            },
            {
                "name": "Scene Description",
                "text": "The nexus chamber was vast and circular. Ancient machinery lined the walls, and in the center",
                "expected_type": "description"
            }
        ]
        
        for scenario in test_scenarios:
            print(f"\n   🎬 {scenario['name']}:")
            print(f"      Text: {scenario['text']}")
            
            suggestion_request = {
                "user_id": user_id,
                "session_id": session_id,
                "current_text": scenario['text'],
                "cursor_position": len(scenario['text'])
            }
            
            try:
                response = await client.post(f"{BASE_URL}/auto_suggest", json=suggestion_request, timeout=20.0)
                if response.status_code == 200:
                    result = response.json()
                    detected_type = result['suggestion_type']
                    confidence = result['confidence_score']
                    
                    print(f"      ✅ Detected: {detected_type} (confidence: {confidence:.1f})")
                    print(f"      💡 Best suggestion: {result['suggestions'][0]}")
                    
                    # Check if detection was accurate
                    if detected_type == scenario['expected_type']:
                        print("      🎯 Accurate detection!")
                    else:
                        print(f"      🤔 Expected {scenario['expected_type']}, got {detected_type}")
                else:
                    print(f"      ❌ Error: {response.status_code}")
            except Exception as e:
                print(f"      ❌ Error: {e}")
        
        print("\n" + "=" * 70)
        print("🎉 Real-Time Auto-Suggestion Test Complete!")
        print()
        print("📋 Frontend Integration Guide:")
        print("1. User types in editor")
        print("2. After 2 seconds of no typing → call /auto_suggest")
        print("3. Display suggestions as overlay/popup")
        print("4. User can accept, reject, or keep typing")
        print("5. Repeat for every pause in typing")
        print()
        print("🚀 Your GitHub Copilot for Creative Writing is ready!")

if __name__ == "__main__":
    print("Starting Real-Time Auto-Suggestion tests...")
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    print("You can start it with: uvicorn Domain:app --reload")
    print()
    
    asyncio.run(test_auto_suggestions())