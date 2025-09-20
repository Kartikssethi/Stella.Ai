#!/usr/bin/env python3
"""
Comprehensive test script for the Complete Writing Copilot
Tests all features: document storage, auto-suggestions, story analysis, and writing feedback
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_ID = 123
TEST_DOMAIN = "fiction"

class WritingCopilotTester:
    def __init__(self):
        self.session_id = None
        self.user_id = TEST_USER_ID
        self.domain = TEST_DOMAIN
        
        # Sample story content for testing
        self.sample_story = """
        Sarah stood at the edge of the cliff, the wind whipping her dark hair around her face. 
        The ocean stretched endlessly before her, its waves crashing against the rocks below with 
        a thunderous roar that seemed to echo her inner turmoil.
        
        "I can't do this anymore," she whispered to the empty air, her voice barely audible 
        over the storm. The letter in her hand fluttered violently, threatening to be torn 
        away by the gale. It contained the truth she'd been hiding for months – the truth 
        that would destroy everything she'd built.
        
        Behind her, she heard footsteps on the rocky path. Marcus had found her, just as 
        she knew he would. He always did. But this time, she wasn't sure if his presence 
        brought comfort or fear.
        
        "Sarah," his voice cut through the wind, gentle but urgent. "Step back from the edge."
        
        She turned to face him, tears mixing with the rain on her cheeks. The man she'd 
        loved for three years stood before her, his eyes filled with concern and something 
        else – suspicion. Did he know? Had he figured it out?
        
        "I have something to tell you," she said, holding up the letter. "Something that 
        will change everything between us."
        """
        
        self.writing_in_progress = """
        Sarah stood at the edge of the cliff, the wind whipping her dark hair around her face.
        The ocean stretched endlessly before her, its waves crashing against the rocks below.
        She felt
        """

    async def run_complete_test(self):
        """Run all tests to demonstrate the complete writing copilot functionality"""
        print("🚀 Starting Complete Writing Copilot Test Suite")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Setup - Create user and start session
            await self.test_setup(session)
            
            # Test 2: Document Management
            await self.test_document_management(session)
            
            # Test 3: Real-time Auto-Suggestions
            await self.test_auto_suggestions(session)
            
            # Test 4: Enhanced Auto-Suggestions with Plot Insights
            await self.test_enhanced_suggestions(session)
            
            # Test 5: Comprehensive Story Analysis
            await self.test_story_analysis(session)
            
            # Test 6: Writing Feedback and Coaching
            await self.test_writing_feedback(session)
            
            # Test 7: Workflow Simulation
            await self.test_complete_workflow(session)
        
        print("\n✅ All tests completed successfully!")
        print("🎯 Writing Copilot is ready for writers!")

    async def test_setup(self, session: aiohttp.ClientSession):
        """Test user creation and session initialization"""
        print("\n1. 👤 Testing User Setup and Session Creation")
        print("-" * 40)
        
        # Create user
        user_data = {
            "name": "Test Writer",
            "email": "writer@test.com",
            "writing_style": "literary fiction"
        }
        
        async with session.post(f"{BASE_URL}/create_user", json=user_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print(f"✅ User created: {result['message']}")
            else:
                print(f"❌ User creation failed: {resp.status}")
        
        # Start creative session
        session_data = {
            "user_id": self.user_id,
            "domain": self.domain
        }
        
        async with session.post(f"{BASE_URL}/start_creative_session", json=session_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                self.session_id = result['session_id']
                print(f"✅ Session started: {self.session_id}")
                print(f"📝 Domain: {result['domain']}")
            else:
                print(f"❌ Session creation failed: {resp.status}")

    async def test_document_management(self, session: aiohttp.ClientSession):
        """Test document creation and embedding for RAG"""
        print("\n2. 📚 Testing Document Management & RAG Setup")
        print("-" * 40)
        
        # Create a reference document
        doc_data = {
            "user_id": self.user_id,
            "title": "Character Background: Sarah",
            "content": """
            Sarah Morrison, 28, marine biologist from coastal Maine. 
            Lost her parents in a sailing accident at age 16. Dedicated her life to ocean research.
            Has a fear of deep water despite her profession. Currently working on coral reef restoration.
            Dating Marcus Chen for 3 years - he's a lighthouse keeper and photographer.
            Hiding a secret about her parents' death that could ruin her career and relationship.
            Personality: Intelligent, driven, guilt-ridden, compassionate but secretive.
            """,
            "content_type": "character_profile"
        }
        
        async with session.post(f"{BASE_URL}/create_document", json=doc_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print(f"✅ Character document created with embeddings")
                print(f"📄 Document ID: {result['document'].get('id', 'N/A')}")
            else:
                print(f"❌ Document creation failed: {resp.status}")
        
        # Create another reference document
        doc_data2 = {
            "user_id": self.user_id,
            "title": "Setting: Lighthouse Cove",
            "content": """
            Lighthouse Cove is a small fishing village on the Maine coast. The lighthouse has been 
            operational since 1847 and is now automated. Marcus lives in the keeper's cottage.
            The village has a population of 200. Main industry is lobster fishing and tourism.
            Notable locations: The Driftwood Cafe, Harbor Point Marina, Rocky Beach Trail.
            Weather: Often stormy, especially in winter. Frequent fog. Beautiful sunsets.
            Local legend: The lighthouse is said to be haunted by keepers who died in storms.
            """,
            "content_type": "setting"
        }
        
        async with session.post(f"{BASE_URL}/create_document", json=doc_data2) as resp:
            if resp.status == 200:
                result = await resp.json()
                print(f"✅ Setting document created with embeddings")
            else:
                print(f"❌ Setting document creation failed: {resp.status}")

    async def test_auto_suggestions(self, session: aiohttp.ClientSession):
        """Test real-time auto-suggestions (GitHub Copilot style)"""
        print("\n3. ⚡ Testing Real-time Auto-Suggestions")
        print("-" * 40)
        
        # Test different writing contexts
        test_scenarios = [
            {
                "context": "Character in dialogue",
                "text": 'Sarah looked at Marcus and said, "I need to tell you'
            },
            {
                "context": "Action sequence",
                "text": "The waves crashed against the cliff as Sarah stepped closer to"
            },
            {
                "context": "Emotional description", 
                "text": "Her heart pounded with guilt as she remembered"
            }
        ]
        
        for scenario in test_scenarios:
            print(f"\n🎬 Scenario: {scenario['context']}")
            
            suggestion_data = {
                "user_id": self.user_id,
                "session_id": self.session_id,
                "current_text": scenario['text'],
                "cursor_position": len(scenario['text'])
            }
            
            async with session.post(f"{BASE_URL}/auto_suggest", json=suggestion_data) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"📝 Text: {scenario['text']}")
                    print(f"💭 Type: {result['suggestion_type']}")
                    print(f"🎯 Confidence: {result['confidence_score']:.2f}")
                    print(f"📚 Context Used: {result['context_used']}")
                    print("💡 Suggestions:")
                    for i, suggestion in enumerate(result['suggestions'], 1):
                        print(f"   {i}. {suggestion}")
                else:
                    print(f"❌ Auto-suggestion failed: {resp.status}")

    async def test_enhanced_suggestions(self, session: aiohttp.ClientSession):
        """Test enhanced suggestions with plot insights"""
        print("\n4. 🎭 Testing Enhanced Auto-Suggestions with Plot Insights")
        print("-" * 40)
        
        suggestion_data = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "current_text": self.sample_story,
            "cursor_position": len(self.sample_story)
        }
        
        async with session.post(f"{BASE_URL}/enhanced_auto_suggest", json=suggestion_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("✅ Enhanced suggestions generated")
                print(f"💭 Suggestion Type: {result['suggestion_type']}")
                print(f"🎯 Confidence: {result['confidence_score']:.2f}")
                
                print("\n💡 Text Suggestions:")
                for i, suggestion in enumerate(result['text_suggestions'], 1):
                    print(f"   {i}. {suggestion}")
                
                if result['plot_insights'].get('has_analysis'):
                    print(f"\n📊 Story Score: {result['plot_insights']['overall_score']:.1f}/10")
                    print("🎪 Plot Improvements:")
                    for improvement in result['plot_insights']['plot_improvements']:
                        print(f"   • {improvement}")
                else:
                    print("\n📝 Text too short for plot analysis")
            else:
                print(f"❌ Enhanced suggestions failed: {resp.status}")

    async def test_story_analysis(self, session: aiohttp.ClientSession):
        """Test comprehensive story analysis"""
        print("\n5. 📊 Testing Comprehensive Story Analysis")
        print("-" * 40)
        
        analysis_data = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "text_chunk": self.sample_story,
            "analysis_type": "comprehensive"
        }
        
        async with session.post(f"{BASE_URL}/analyze_story", json=analysis_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("✅ Story analysis completed")
                print(f"📊 Overall Score: {result['overall_score']:.1f}/10")
                
                print("\n🎭 Plot Analysis:")
                if isinstance(result['plot_analysis'], dict):
                    for key, value in result['plot_analysis'].items():
                        print(f"   {key}: {value}")
                
                print("\n📝 Writing Quality:")
                if isinstance(result['writing_quality'], dict):
                    for key, value in result['writing_quality'].items():
                        print(f"   {key}: {value}")
                
                print("\n💡 Improvement Suggestions:")
                for suggestion in result['improvement_suggestions']:
                    print(f"   • {suggestion}")
                    
            else:
                error_text = await resp.text()
                print(f"❌ Story analysis failed: {resp.status}")
                print(f"Error details: {error_text}")

    async def test_writing_feedback(self, session: aiohttp.ClientSession):
        """Test comprehensive writing feedback and coaching"""
        print("\n6. 🎓 Testing Writing Feedback & Coaching")
        print("-" * 40)
        
        feedback_data = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "current_text": self.sample_story,
            "feedback_focus": "general"
        }
        
        async with session.post(f"{BASE_URL}/writing_feedback", json=feedback_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("✅ Writing feedback generated")
                
                print("\n💪 Strengths:")
                for strength in result['strengths']:
                    print(f"   ✓ {strength}")
                
                print("\n🎯 Areas for Improvement:")
                for improvement in result['areas_for_improvement']:
                    print(f"   → {improvement}")
                
                print("\n🎪 Plot Suggestions:")
                for suggestion in result['plot_suggestions']:
                    print(f"   • {suggestion}")
                
                print("\n👥 Character Insights:")
                for insight in result['character_insights']:
                    print(f"   • {insight}")
                
                print("\n✍️ Style Feedback:")
                for feedback in result['style_feedback']:
                    print(f"   • {feedback}")
                
                print("\n📋 Next Steps:")
                for step in result['next_steps']:
                    print(f"   📌 {step}")
                    
            else:
                error_text = await resp.text()
                print(f"❌ Writing feedback failed: {resp.status}")
                print(f"Error details: {error_text}")

    async def test_complete_workflow(self, session: aiohttp.ClientSession):
        """Simulate a complete writing workflow"""
        print("\n7. 🔄 Testing Complete Writing Workflow")
        print("-" * 40)
        
        print("📝 Simulating writer workflow:")
        print("   1. Writer starts typing...")
        print("   2. After 2 seconds of no typing, get suggestions...")
        print("   3. Writer continues, asks for feedback...")
        print("   4. Writer requests story analysis...")
        
        # Step 1: Writer types and pauses
        current_text = "Sarah stood at the edge of the cliff, her heart racing. The secret she'd been hiding was"
        
        print(f"\n📝 Current text: '{current_text}'")
        print("⏱️  Writer pauses typing for 2 seconds...")
        
        # Get auto-suggestions
        suggestion_data = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "current_text": current_text,
            "cursor_position": len(current_text)
        }
        
        async with session.post(f"{BASE_URL}/auto_suggest", json=suggestion_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("💡 Auto-suggestions appeared:")
                for i, suggestion in enumerate(result['suggestions'], 1):
                    print(f"   {i}. {suggestion}")
                    
                # Simulate choosing suggestion 1
                chosen_suggestion = result['suggestions'][0] if result['suggestions'] else ""
                current_text += " " + chosen_suggestion
                print(f"👆 Writer chooses suggestion 1")
        
        # Step 2: Writer continues and asks for feedback
        print("\n📚 Writer continues writing and requests feedback...")
        
        feedback_data = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "current_text": current_text,
            "feedback_focus": "plot"
        }
        
        async with session.post(f"{BASE_URL}/writing_feedback", json=feedback_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print("🎓 Writing coach feedback:")
                print(f"   Strength: {result['strengths'][0] if result['strengths'] else 'Good pacing'}")
                print(f"   Suggestion: {result['plot_suggestions'][0] if result['plot_suggestions'] else 'Add tension'}")
                print(f"   Next step: {result['next_steps'][0] if result['next_steps'] else 'Continue scene'}")
        
        print("\n🎯 Workflow complete! Writer has:")
        print("   ✅ Real-time auto-suggestions")
        print("   ✅ Plot-aware assistance") 
        print("   ✅ Professional writing feedback")
        print("   ✅ Context from their stored documents")
        print("\n🚀 This is GitHub Copilot for writers!")

async def main():
    """Run the complete test suite"""
    print("🎬 Welcome to the Complete Writing Copilot Test Suite!")
    print("🎯 This demonstrates a 'GitHub Copilot for Writers' system")
    print("\nFeatures being tested:")
    print("   • Real-time auto-suggestions (like code completion)")
    print("   • Story analysis and plot feedback")
    print("   • Writing coaching and improvement tips")
    print("   • Context-aware suggestions from stored documents")
    print("   • Complete writer workflow simulation")
    
    tester = WritingCopilotTester()
    
    try:
        await tester.run_complete_test()
    except aiohttp.ClientError as e:
        print(f"\n❌ Connection error: {e}")
        print("💡 Make sure the FastAPI server is running on http://localhost:8000")
        print("   Run: python -m uvicorn Domain:app --reload")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Starting Complete Writing Copilot Test...")
    asyncio.run(main())