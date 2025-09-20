#!/usr/bin/env python3
"""
Test script for Supabase Creative Writing API
"""
import asyncio
import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_api():
    async with httpx.AsyncClient() as client:
        print("🚀 Testing Creative AI Writing Assistant API with Supabase")
        print("=" * 60)
        
        # Test 1: Create a user
        print("1. Creating a new user...")
        user_data = {
            "name": "Jane Writer",
            "email": "jane@example.com"
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
        
        # Test 3: Create a book idea document
        print("\n3. Creating a book idea...")
        try:
            book_data = {
                "title": "The Last Digital Mage",
                "type": "book_idea",
                "description": "In a world where magic and technology have merged, a young programmer discovers she can cast spells through code. As the last of the digital mages, she must save both the virtual and physical worlds from an AI that has learned to wield dark magic.",
                "created_by": user_id
            }
            response = await client.post(f"{BASE_URL}/create_document", json=book_data)
            if response.status_code == 200:
                doc_result = response.json()
                book_id = doc_result["document"]["id"]
                print(f"✅ Book idea created: {doc_result['document']['title']} (ID: {book_id})")
            else:
                print(f"❌ Failed to create book idea: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error creating book idea: {e}")
            return
        
        # Test 4: Create a character document
        print("\n4. Creating a character...")
        try:
            character_data = {
                "title": "Maya Chen - Protagonist",
                "type": "character",
                "description": "Maya Chen, 24, a brilliant software engineer turned digital mage. Personality: curious, determined, sometimes reckless when coding. Background: Grew up in San Francisco, parents were tech entrepreneurs. Special abilities: Can write spells in Python, JavaScript, and ancient runic languages. Weakness: Struggles with self-doubt and the weight of being the last digital mage.",
                "created_by": user_id
            }
            response = await client.post(f"{BASE_URL}/create_document", json=character_data)
            if response.status_code == 200:
                char_result = response.json()
                char_id = char_result["document"]["id"]
                print(f"✅ Character created: {char_result['document']['title']} (ID: {char_id})")
            else:
                print(f"❌ Failed to create character: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error creating character: {e}")
            return
        
        # Test 5: Get all user documents
        print("\n5. Retrieving all user documents...")
        try:
            response = await client.get(f"{BASE_URL}/users/{user_id}/documents")
            if response.status_code == 200:
                documents = response.json()
                print(f"✅ Found {len(documents)} documents for user:")
                for doc in documents:
                    print(f"   - {doc['title']} ({doc['type']})")
            else:
                print(f"❌ Failed to get documents: {response.text}")
                return
        except Exception as e:
            print(f"❌ Error getting documents: {e}")
            return
        
        # Test 6: Get creative info
        print("\n6. Getting creative domain information...")
        try:
            response = await client.get(f"{BASE_URL}/creative_info")
            if response.status_code == 200:
                info = response.json()
                print(f"✅ Creative domain info retrieved:")
                print(f"   Domain: {info['domain']}")
                print(f"   Available types: {[dt['type'] for dt in info['document_types']]}")
            else:
                print(f"❌ Failed to get creative info: {response.text}")
        except Exception as e:
            print(f"❌ Error getting creative info: {e}")
        
        print("\n" + "=" * 60)
        print("🎉 API Test Complete! All Supabase integrations working!")

if __name__ == "__main__":
    print("Starting API tests...")
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    print("You can start it with: uvicorn Domain:app --reload")
    print()
    
    asyncio.run(test_api())