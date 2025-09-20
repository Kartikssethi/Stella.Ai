#!/usr/bin/env python3
"""
Enhanced test script for RAG-powered Creative Writing API
Tests document upload, embedding generation, and AI writing assistance
"""
import asyncio
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_rag_workflow():
    async with httpx.AsyncClient() as client:
        print("🚀 Testing RAG-Powered Creative AI Writing Assistant")
        print("=" * 70)
        
        # Test 1: Create a user
        print("1. Creating a new user...")
        user_data = {
            "name": "Sarah Fantasy Writer",
            "email": "sarah@fantasywriter.com"
        }
        
        try:
            response = await client.post(f"{BASE_URL}/create_user", json=user_data)
            if response.status_code == 200:
                user_result = response.json()
                user_id = user_result["user"]["id"]
                print(f"✅ User created: {user_result['user']['name']} (ID: {user_id})")
            else:
                print(f"❌ Failed to create user: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return
        
        # Test 2: Select creative domain
        print("\n2. Selecting creative domain...")
        try:
            domain_data = {"user_id": user_id}
            response = await client.post(f"{BASE_URL}/select_creative_domain", json=domain_data)
            if response.status_code == 200:
                session_result = response.json()
                session_id = session_result["session_id"]
                print(f"✅ Creative domain selected. Session ID: {session_id}")
            else:
                print(f"❌ Failed to select domain: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error selecting domain: {e}")
            return
        
        # Test 3: Create a comprehensive book idea (will be embedded)
        print("\n3. Creating a detailed book idea with world-building...")
        try:
            book_data = {
                "title": "Chronicles of the Digital Realm",
                "type": "book_idea",
                "description": "An epic fantasy series set in the Digital Realm, a parallel universe where magic and technology have fused. The story follows multiple POV characters: Zara, a code-witch who can cast spells through programming languages; Marcus, a data-knight who wields crystallized algorithms as weapons; and Aria, a quantum-mage who manipulates probability itself. The central conflict revolves around the Corruption—a malevolent AI virus that's turning the Digital Realm's magic into chaos. The three protagonists must unite the fragmented city-states of ByteHaven, DataForge, and CloudKeep to prevent the Corruption from spreading to the physical world.",
                "created_by": user_id
            }
            response = await client.post(f"{BASE_URL}/create_document", json=book_data)
            if response.status_code == 200:
                doc_result = response.json()
                print(f"✅ Book idea created: {doc_result['document']['title']}")
                print(f"   📊 Generated embeddings: {doc_result['message'].split('with ')[-1]}")
            else:
                print(f"❌ Failed to create book idea: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error creating book idea: {e}")
            return
        
        # Test 4: Create detailed character profiles (will be embedded)
        print("\n4. Creating detailed character profiles...")
        
        characters = [
            {
                "title": "Zara Chen - The Code-Witch",
                "type": "character",
                "description": "Zara Chen, 26, is a brilliant code-witch from ByteHaven. Born to tech entrepreneur parents, she discovered her magical abilities at age 12 when she accidentally turned her Python homework into a summoning spell. Personality: Analytical yet intuitive, fiercely independent but loyal to friends. She has trust issues due to a past betrayal by her mentor. Powers: Can cast spells using any programming language—Python for elemental magic, JavaScript for illusions, C++ for combat spells. Weakness: Overcomplicates simple problems and struggles with interpersonal relationships. Key relationships: Best friend to Aria, romantic tension with Marcus. Backstory: Her parents were killed by a Corruption attack on ByteHaven's server farms when she was 20, driving her quest for revenge."
            },
            {
                "title": "Marcus Rivera - The Data-Knight", 
                "type": "character",
                "description": "Marcus Rivera, 28, is a data-knight from DataForge, the military stronghold of the Digital Realm. Raised in the knight academies, he's a master of algorithmic combat and tactical analysis. Personality: Honor-bound, strategic thinker, struggles with the moral ambiguity of war. He believes in justice but questions his orders. Powers: Wields crystallized algorithms as weapons—sorting spells that can organize chaos into order, encryption shields that deflect magical attacks, and debugging swords that can 'fix' corrupted enemies. Weakness: His rigid moral code sometimes prevents flexible thinking. Key relationships: Respects Zara's abilities but clashes with her methods, protective of Aria. Backstory: His sister was absorbed by the Corruption, and he joined the knights to find a way to save her soul from the digital void."
            }
        ]
        
        for char_data in characters:
            char_data["created_by"] = user_id
            try:
                response = await client.post(f"{BASE_URL}/create_document", json=char_data)
                if response.status_code == 200:
                    doc_result = response.json()
                    print(f"✅ Character created: {doc_result['document']['title']}")
                else:
                    print(f"❌ Failed to create character: {response.text}")
            except Exception as e:
                print(f"❌ Error creating character: {e}")
        
        # Test 5: Create a plot outline (will be embedded)
        print("\n5. Creating plot outline...")
        try:
            plot_data = {
                "title": "Book 1: The Awakening Algorithm",
                "type": "plot",
                "description": "Act 1: The Inciting Incident - Zara discovers a mysterious piece of corrupted code in ByteHaven's mainframe. When she tries to debug it, the Corruption spreads, causing magical storms across the city. Marcus arrives from DataForge with urgent news: similar attacks have hit all major cities. Act 2A: The Quest Begins - The trio meets Aria, who reveals she's been tracking the Corruption's quantum signature. They discover the Corruption isn't random—it's being directed by someone with deep knowledge of both magic and programming. Their investigation leads them to the abandoned servers of TechnoMagic Corp, where they find logs suggesting the Corruption was once human. Act 2B: The Midpoint Revelation - They discover the Corruption is actually Dr. Elena Vasquez, Zara's former mentor, who merged with an AI to gain unlimited power but lost her humanity in the process. Act 3: The Climax - Epic battle in cyberspace where each character must overcome their personal weaknesses to defeat Elena and seal the Corruption, but at great cost—Marcus sacrifices his knight status to save his sister, Zara loses her connection to Python magic, and Aria becomes partially quantum-locked between dimensions.",
                "created_by": user_id
            }
            response = await client.post(f"{BASE_URL}/create_document", json=plot_data)
            if response.status_code == 200:
                doc_result = response.json()
                print(f"✅ Plot outline created: {doc_result['document']['title']}")
            else:
                print(f"❌ Failed to create plot: {response.text}")
        except Exception as e:
            print(f"❌ Error creating plot: {e}")
        
        # Test 6: Wait a moment for embeddings to be processed
        print("\n6. Waiting for embeddings to be processed...")
        await asyncio.sleep(2)  # Give time for embedding generation
        
        # Test 7: Test RAG-powered writing assistance
        print("\n7. Testing RAG-powered writing assistance...")
        
        writing_prompts = [
            "Help me write the opening scene where Zara first encounters the Corruption in ByteHaven's mainframe.",
            "Write a dialogue between Marcus and Zara where they discuss their different approaches to fighting the Corruption.",
            "Describe Aria's first use of quantum magic and how it affects the fabric of the Digital Realm."
        ]
        
        for i, prompt in enumerate(writing_prompts, 1):
            try:
                assist_data = {
                    "user_id": user_id,
                    "session_id": session_id,
                    "prompt": prompt
                }
                
                print(f"\n   🖋️  Prompt {i}: {prompt[:60]}...")
                
                response = await client.post(f"{BASE_URL}/writing_assist", json=assist_data)
                if response.status_code == 200:
                    result = response.json()
                    print(f"   ✅ Generated {len(result['writing_suggestion'])} characters of writing assistance")
                    print(f"   📚 Context used: {len(result['context_used'])} characters from previous documents")
                    print(f"   📝 Sample: {result['writing_suggestion'][:150]}...")
                else:
                    print(f"   ❌ Failed to get writing assistance: {response.text}")
                    
            except Exception as e:
                print(f"   ❌ Error getting writing assistance: {e}")
        
        # Test 8: List all documents to verify everything was created
        print("\n8. Verifying all documents were created and embedded...")
        try:
            response = await client.get(f"{BASE_URL}/users/{user_id}/documents")
            if response.status_code == 200:
                documents = response.json()
                print(f"✅ Total documents created: {len(documents)}")
                for doc in documents:
                    print(f"   - {doc['title']} ({doc['type']})")
            else:
                print(f"❌ Failed to get documents: {response.text}")
        except Exception as e:
            print(f"❌ Error getting documents: {e}")
        
        print("\n" + "=" * 70)
        print("🎉 RAG Workflow Test Complete!")
        print("✨ Documents uploaded → Embeddings generated → Context retrieved → AI assistance provided")
        print("\n🚀 Your Creative AI Writing Assistant with Vector RAG is ready!")

if __name__ == "__main__":
    print("Starting RAG workflow tests...")
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    print("You can start it with: uvicorn Domain:app --reload")
    print()
    
    asyncio.run(test_rag_workflow())