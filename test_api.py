#!/usr/bin/env python3
"""Test the API endpoint to verify recommendations are working"""

import requests
import json

def test_api():
    try:
        # Test data
        test_payload = {"text": "I feel anxious today"}
        
        # Make request
        response = requests.post(
            "http://127.0.0.1:8000/analyze",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response successful!")
            print(f"Risk Level: {data.get('risk', 'N/A')}")
            print(f"Supportive Message: {data.get('supportive_message', 'N/A')[:100]}...")
            
            # Check if recommendations exist
            recommendations = data.get('recommendations', {})
            if recommendations:
                print("✅ Recommendations found!")
                print(f"Recommendation categories: {list(recommendations.keys())}")
                
                # Show sample recommendations
                for category, items in recommendations.items():
                    if items and len(items) > 0:
                        print(f"\n{category.title()} ({len(items)} items):")
                        for i, item in enumerate(items[:2]):  # Show first 2
                            if isinstance(item, dict):
                                if 'text' in item:
                                    print(f"  - {item['text'][:80]}...")
                                elif 'title' in item:
                                    print(f"  - {item['title']}")
                                else:
                                    print(f"  - {str(item)[:80]}...")
                            else:
                                print(f"  - {str(item)[:80]}...")
            else:
                print("❌ No recommendations found in response!")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Is the server running?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()
