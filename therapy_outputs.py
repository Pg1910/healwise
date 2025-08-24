"""
Test therapeutic integration with enhanced outputs
"""
import requests
import json

def test_therapeutic_outputs():
    """Test therapeutic response quality"""
    print("🧠 Testing Enhanced Therapeutic Outputs")
    print("=" * 45)
    
    therapeutic_test_cases = [
        "I've been feeling really anxious about my job interview tomorrow",
        "I'm going through a difficult breakup and feel completely lost", 
        "I feel like everyone would be better off without me",
        "I can't stop thinking about hurting myself",
        "I'm having the best day ever! Everything is going perfectly!"
    ]
    
    for text in therapeutic_test_cases:
        print(f"\n💬 Input: '{text}'")
        print("-" * 50)
        
        try:
            response = requests.post(
                "http://127.0.0.1:8000/analyze",
                json={"text": text},
                timeout=45  # Longer timeout for LLM processing
            )
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"🎯 Risk Level: {data['risk']}")
                print(f"💝 Therapeutic Response:")
                print(f"   {data['supportive_message']}")
                print(f"📋 Suggested Steps ({len(data['suggested_next_steps'])}):")
                for i, step in enumerate(data['suggested_next_steps'], 1):
                    print(f"   {i}. {step}")
                print(f"📚 Resources ({len(data['helpful_resources'])}):")
                for i, resource in enumerate(data['helpful_resources'], 1):
                    print(f"   {i}. {resource}")
                    
                # Assess therapeutic quality
                message = data['supportive_message']
                print(f"\n📊 Response Quality Check:")
                print(f"   ✓ Length appropriate: {len(message.split())} words")
                print(f"   ✓ Empathetic tone: {'yes' if any(word in message.lower() for word in ['understand', 'feel', 'hear', 'valid']) else 'needs improvement'}")
                print(f"   ✓ Non-judgmental: {'yes' if not any(word in message.lower() for word in ['should', 'must', 'wrong']) else 'needs improvement'}")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   {response.text}")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_therapeutic_outputs()