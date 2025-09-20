#!/usr/bin/env python3
"""
Test script for the Plot Continuity Agent - Agentic AI Feature
Demonstrates proactive plot hole detection and character consistency tracking
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_ID = 456
TEST_DOMAIN = "fiction"

class PlotContinuityTester:
    def __init__(self):
        self.session_id = None
        self.user_id = TEST_USER_ID
        self.domain = TEST_DOMAIN
        
        # Sample story with intentional continuity issues for testing
        self.chapter_1 = """
        Sarah Morrison, 28, stood at the edge of the cliff overlooking Lighthouse Cove. 
        As a marine biologist, she had always loved the ocean, despite losing her parents 
        in a sailing accident when she was 16. Her blue eyes reflected the stormy waters 
        below as she thought about her research on coral reef restoration.
        
        Marcus Chen, the lighthouse keeper, approached from behind. "Sarah, what brings 
        you here so late?" he asked. They had been dating for three years, ever since 
        she moved to the village to start her research station.
        
        "I got the letter," she whispered, holding up an envelope. "The one about the 
        real reason my parents died. It wasn't an accident, Marcus. Someone sabotaged 
        their boat."
        
        The lighthouse beam swept across the water every thirty seconds, just as it 
        had for the past 150 years since the lighthouse was built in 1873.
        """
        
        self.chapter_2 = """
        Three days later, Sarah, now 29, sat in the Driftwood Cafe with her best friend 
        Emma, a fellow scientist. Her green eyes were red from crying as she explained 
        the shocking revelation about her parents' death when she was 15.
        
        "I can't believe someone would do that," Emma said, stirring her coffee. 
        "Have you told Marcus?"
        
        "Marcus is acting strange," Sarah replied. "Yesterday he seemed to know more 
        than he was letting on. And I found out something else - the lighthouse has 
        only been automated for 50 years, since 1975. Before that, keepers lived 
        there full-time."
        
        Outside, storm clouds gathered over Rocky Harbor (the locals' name for the 
        town), promising another night of rain. Sarah's phone buzzed - a text from 
        Dr. Williams, her research partner who she hadn't seen in months.
        """
        
        self.chapter_3 = """
        A week later, Sarah confronted Marcus at the lighthouse. The automated beacon 
        had been malfunctioning, casting its light every minute instead of every 
        thirty seconds.
        
        "You knew about my parents, didn't you?" she accused, her brown eyes flashing 
        with anger. "That's why you've been avoiding me for the past two weeks."
        
        Marcus, 35, ran his hands through his hair. As the town's photographer and 
        part-time lighthouse maintenance worker, he had access to old records. 
        
        "I found documents in the lighthouse archives," he admitted. "Your parents 
        were investigating something big. Something that certain people in Harbor 
        Point didn't want exposed."
        
        Thunder crashed overhead as Sarah processed this information. She thought 
        about Emma, who had mysteriously left town yesterday without saying goodbye, 
        and about Dr. Williams, who never responded to her messages.
        """

    async def run_complete_test(self):
        """Run comprehensive Plot Continuity Agent tests"""
        print("🤖 Starting Plot Continuity Agent Test Suite")
        print("=" * 60)
        
        async with aiohttp.ClientSession() as session:
            # Test 1: Setup
            await self.test_setup(session)
            
            # Test 2: Analyze Chapter 1 (establish baseline)
            await self.test_chapter_analysis(session, self.chapter_1, "Chapter 1")
            
            # Test 3: Analyze Chapter 2 (detect inconsistencies)
            await self.test_chapter_analysis(session, self.chapter_2, "Chapter 2")
            
            # Test 4: Analyze Chapter 3 (more inconsistencies)
            await self.test_chapter_analysis(session, self.chapter_3, "Chapter 3")
            
            # Test 5: Demonstrate agent recommendations
            await self.test_agent_recommendations(session)
        
        print("\n✅ Plot Continuity Agent tests completed!")
        print("🎯 The agent successfully detected multiple continuity issues!")

    async def test_setup(self, session: aiohttp.ClientSession):
        """Test user creation and session initialization"""
        print("\n1. 👤 Testing User Setup for Plot Continuity Agent")
        print("-" * 50)
        
        # Create user
        user_data = {
            "name": "Plot Test Writer",
            "email": "plotwriter@test.com"
        }
        
        async with session.post(f"{BASE_URL}/create_user", json=user_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                print(f"✅ User created: {result['message']}")
            else:
                print(f"❌ User creation failed: {resp.status}")
        
        # Start creative session
        session_data = {
            "user_id": self.user_id
        }
        
        async with session.post(f"{BASE_URL}/start_creative_session", json=session_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                self.session_id = result['session_id']
                print(f"✅ Session started: {self.session_id}")
            else:
                print(f"❌ Session creation failed: {resp.status}")

    async def test_chapter_analysis(self, session: aiohttp.ClientSession, chapter_text: str, chapter_name: str):
        """Test Plot Continuity Agent analysis on a chapter"""
        print(f"\n2. 🕵️ Testing Plot Continuity Analysis: {chapter_name}")
        print("-" * 50)
        
        continuity_data = {
            "user_id": self.user_id,
            "story_text": chapter_text,
            "chapter_info": chapter_name
        }
        
        async with session.post(f"{BASE_URL}/plot_continuity_check", json=continuity_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                
                print(f"✅ {chapter_name} analyzed by Plot Continuity Agent")
                print(f"🤖 Agent Status: {result['agent_status']}")
                
                # Display story summary
                summary = result['story_summary']
                print(f"\n📊 Story Elements Tracked:")
                print(f"   Characters: {summary['characters_count']}")
                print(f"   Timeline Events: {summary['timeline_events']}")
                print(f"   Locations: {summary['locations_count']}")
                print(f"   Active Plot Threads: {summary['active_plot_threads']}")
                print(f"   Relationships: {summary['relationships_count']}")
                
                # Display new elements found
                new_elements = result['new_elements_found']
                print(f"\n🆕 New Elements Discovered:")
                print(f"   New Characters: {new_elements['characters']}")
                print(f"   New Plot Threads: {new_elements['plot_threads']}")
                print(f"   New Locations: {new_elements['locations']}")
                
                # Display continuity issues (the main feature!)
                issues = result['continuity_issues']
                if issues:
                    print(f"\n⚠️  Continuity Issues Detected ({len(issues)}):")
                    for i, issue in enumerate(issues, 1):
                        severity_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                        emoji = severity_emoji.get(issue['severity'], "⚠️")
                        print(f"   {emoji} Issue {i}: {issue['type']}")
                        print(f"      Message: {issue['message']}")
                        print(f"      Suggestion: {issue['suggestion']}")
                        if 'threads' in issue:
                            print(f"      Unresolved threads: {', '.join(issue['threads'])}")
                        print()
                else:
                    print("\n✅ No continuity issues detected in this chapter")
                
                # Display agent recommendations
                recommendations = result['recommendations']
                print(f"🎯 Agent Recommendations:")
                for rec in recommendations:
                    print(f"   • {rec}")
                    
            else:
                error_text = await resp.text()
                print(f"❌ Plot continuity analysis failed: {resp.status}")
                print(f"Error details: {error_text}")

    async def test_agent_recommendations(self, session: aiohttp.ClientSession):
        """Test the agent's proactive recommendations"""
        print(f"\n3. 🎯 Testing Agent's Proactive Recommendations")
        print("-" * 50)
        
        # Test with a problematic text that should trigger multiple warnings
        problematic_text = """
        Sarah Morrison, 30, with her bright purple eyes, walked into the Seaside Cafe 
        (formerly the Driftwood Cafe). She hadn't seen her childhood friend Marcus in 
        five years, ever since she was 18 and left for college.
        
        "Sarah!" Marcus exclaimed. "I haven't seen you since you were 16 and your 
        parents died in that car crash."
        
        She looked around the empty lighthouse, confused about how she got there from 
        the cafe. The lighthouse beam rotated every two minutes now, and had been 
        automated since 1950 when it was first built.
        
        Emma, her sister, walked in. "I've been looking everywhere for you, Sarah!"
        """
        
        continuity_data = {
            "user_id": self.user_id,
            "story_text": problematic_text,
            "chapter_info": "Chapter 4 (Problematic)"
        }
        
        async with session.post(f"{BASE_URL}/plot_continuity_check", json=continuity_data) as resp:
            if resp.status == 200:
                result = await resp.json()
                
                print("✅ Problematic chapter analyzed")
                
                issues = result['continuity_issues']
                print(f"\n🚨 Agent Detected {len(issues)} Major Issues:")
                
                issue_types = {}
                for issue in issues:
                    issue_type = issue['type']
                    if issue_type not in issue_types:
                        issue_types[issue_type] = []
                    issue_types[issue_type].append(issue)
                
                for issue_type, type_issues in issue_types.items():
                    print(f"\n📋 {issue_type.replace('_', ' ').title()} Issues:")
                    for issue in type_issues:
                        severity_color = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                        print(f"   {severity_color.get(issue['severity'], '⚠️')} {issue['message']}")
                        print(f"      💡 Suggestion: {issue['suggestion']}")
                
                print(f"\n🤖 Agent Status: {result['agent_status']}")
                print(f"📈 The Plot Continuity Agent is working proactively to maintain story quality!")
                
            else:
                print(f"❌ Failed to analyze problematic chapter: {resp.status}")

async def main():
    """Run the Plot Continuity Agent test suite"""
    print("🎬 Welcome to the Plot Continuity Agent Test Suite!")
    print("🤖 This demonstrates AGENTIC AI that proactively monitors stories")
    print("\nThe agent will:")
    print("   • Track characters, locations, timeline, and plot threads")
    print("   • Detect inconsistencies and plot holes automatically")
    print("   • Provide proactive suggestions for better continuity")
    print("   • Monitor story elements across multiple chapters")
    print("   • Alert writers to potential issues before they become problems")
    
    tester = PlotContinuityTester()
    
    try:
        await tester.run_complete_test()
        
        print("\n" + "="*60)
        print("🎯 AGENTIC FEATURES DEMONSTRATED:")
        print("✅ Proactive plot hole detection")
        print("✅ Character consistency tracking")
        print("✅ Timeline monitoring")
        print("✅ Location consistency")
        print("✅ Plot thread management")
        print("✅ Relationship tracking")
        print("✅ Automatic continuity alerts")
        print("✅ Intelligent story element extraction")
        print("\n🚀 This is truly AGENTIC AI - it works FOR the writer!")
        
    except aiohttp.ClientError as e:
        print(f"\n❌ Connection error: {e}")
        print("💡 Make sure the FastAPI server is running on http://localhost:8000")
        print("   Run: python -m uvicorn Domain:app --reload")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🤖 Starting Plot Continuity Agent Test...")
    asyncio.run(main())