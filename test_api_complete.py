import requests
import json
import time
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_api():
    """Test the complete API with fixed emotion detection and recommendations"""
    url = "http://127.0.0.1:8000/analyze"
    
    test_cases = [
        {
            "name": "Sad input (should show sadness, not admiration)",
            "text": "I feel sad and lonely"
        },
        {
            "name": "Anxious input",
            "text": "I'm really anxious about tomorrow"
        },
        {
            "name": "Happy input",
            "text": "I'm feeling great today!"
        }
    ]
    
    print("🧪 Testing HealWise API with fixed emotion detection...")
    print("=" * 70)
    
    for test_case in test_cases:
        print(f"\n📝 Test: {test_case['name']}")
        print(f"Input: '{test_case['text']}'")
        print("-" * 50)
        
        try:
            payload = {"text": test_case["text"]}
            
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check emotion detection
                print("🎭 Emotions detected:")
                if 'probs' in data:
                    for emotion, prob in data['probs'].items():
                        print(f"  - {emotion}: {prob:.2f}")
                
                # Check risk assessment
                print(f"\n⚠️  Risk level: {data.get('risk', 'Unknown')}")
                
                # Check supportive message
                print(f"\n💝 Supportive message:")
                print(f"  {data.get('supportive_message', 'No message')}")
                
                # Check recommendations
                print(f"\n📚 Recommendations available:")
                recommendations = data.get('recommendations', {})
                for category, items in recommendations.items():
                    print(f"  - {category}: {len(items) if items else 0} items")
                    if items and len(items) > 0:
                        # Show first item structure
                        first_item = items[0]
                        if isinstance(first_item, dict):
                            keys = list(first_item.keys())
                            print(f"    Sample item has keys: {keys}")
                        else:
                            print(f"    Sample item: {str(first_item)[:50]}...")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
        
        print("\n" + "=" * 70)

if __name__ == "__main__":
    # Wait a moment for server to be ready
    time.sleep(2)
    test_api()
