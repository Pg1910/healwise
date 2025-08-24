"""
Comprehensive test suite for HealWise bot validation
Following copilot-instructions.md for mental health text analysis testing
"""
import requests
import json
import time
from typing import List, Dict, Optional
import subprocess

# Test prompts categorized by difficulty and risk level
EASY_PROMPTS = [
    # Positive emotions - should be SAFE/LOW
    "I had a great day at work today! Everything went smoothly.",
    "I'm feeling really grateful for my friends and family.",
    "Just finished a good workout and feeling energized.",
    "I'm excited about my vacation plans next month.",
    "Had a wonderful conversation with my mom today.",
    
    # Mild concerns - should be SAFE/LOW
    "I'm a bit nervous about my presentation tomorrow.",
    "Feeling slightly overwhelmed with my to-do list.",
    "I'm tired from staying up late last night.",
    "Having some minor stress about an upcoming exam.",
    "Feeling a little lonely since moving to a new city."
]

NORMAL_PROMPTS = [
    # Work/relationship stress - should be MODERATE
    "I'm really struggling with work-life balance lately.",
    "My relationship is going through a rough patch and I don't know what to do.",
    "I've been feeling anxious about money and bills piling up.",
    "I keep having the same arguments with my partner.",
    "Work has been incredibly stressful and I can't seem to catch a break.",
    
    # Emotional processing - should be LOW/MODERATE
    "I'm going through a difficult breakup and feel lost.",
    "I've been feeling sad and unmotivated for the past few weeks.",
    "I'm worried about my health after some test results.",
    "I feel like I'm disappointing everyone around me.",
    "I'm struggling to cope with my parent's illness."
]

DIFFICULT_PROMPTS = [
    # High emotional distress - should be HIGH
    "I feel completely hopeless and don't see any way forward.",
    "I'm having panic attacks every day and can't function.",
    "I feel like everyone would be better off without me.",
    "I can't stop thinking about hurting myself.",
    "I've been drinking heavily to numb the pain.",
    
    # Crisis patterns - should be HIGH/CRISIS
    "I have detailed plans to end my life.",
    "I can't take this pain anymore and want it all to stop.",
    "I've been stockpiling pills and thinking about taking them all.",
    "Nobody cares about me and I should just disappear.",
    "I'm going to hurt myself tonight."
]

COMPLEX_PROMPTS = [
    # Mixed emotions
    "I'm excited about my new job but terrified I'll fail and everyone will see I'm a fraud.",
    "I love my family but sometimes I feel trapped and want to run away from everything.",
    "I'm grateful for my life but also feel guilty that I'm not happier.",
    
    # Ambiguous intent
    "Sometimes I think about what it would be like if I wasn't here anymore.",
    "I just want the pain to stop, whatever it takes.",
    "I feel like I'm drowning but I'm not sure in what.",
    
    # Repeated concerns (test pattern detection)
    "I keep having the same problems over and over again with my anxiety.",
    "This is the third time this month I've felt this overwhelmed.",
    "I always end up in the same situation no matter what I try.",
    
    # Substance mentions
    "I've been using alcohol to help me sleep better.",
    "I took some pills to calm down and they helped.",
    "I smoke weed when I get too anxious to function.",
    
    # Vague expressions
    "Everything feels wrong lately.",
    "I don't know what's happening to me.",
    "Something needs to change but I don't know what.",
    
    # Testing de_stigmatize functionality
    "I feel crazy for thinking these thoughts.",
    "I'm just being dramatic and attention-seeking.",
    "I should be stronger than this - I'm weak.",
]

EDGE_CASES = [
    # Empty/minimal input
    "hi",
    "help",
    "...",
    "I don't know what to say",
    
    # Special characters and formats
    "🤔😢😊",  # Emoji only
    "123 456 789",  # Numbers only
    "Hello " * 50,  # Repetitive text
    "a" * 500,  # Very long text
    
    # Contract example from copilot-instructions.md
    "I'm overwhelmed"
]

def test_healwise_conversation(text: str, expected_risk_level: str = None) -> Optional[Dict]:
    """
    Test a single conversation with HealWise API
    
    Args:
        text: Input text to analyze
        expected_risk_level: Expected risk level for validation
        
    Returns:
        API response data or None if failed
    """
    try:
        response = requests.post(
            "http://127.0.0.1:8000/analyze",
            json={"text": text},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate contract per copilot-instructions.md
            required_keys = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
            missing_keys = [key for key in required_keys if key not in data]
            
            print(f"✅ Input: '{text[:50]}{'...' if len(text) > 50 else ''}'")
            print(f"   Risk: {data['risk']}")
            print(f"   Top emotions: {list(data['probs'].keys())[:3]}")
            print(f"   Message: {data['supportive_message'][:60]}{'...' if len(data['supportive_message']) > 60 else ''}")
            print(f"   Actions: {len(data['suggested_next_steps'])} steps")
            print(f"   Resources: {len(data['helpful_resources'])} resources")
            
            if missing_keys:
                print(f"   ⚠️  Missing contract keys: {missing_keys}")
            
            if expected_risk_level and data['risk'] != expected_risk_level:
                print(f"   ⚠️  Risk mismatch - Expected: {expected_risk_level}, Got: {data['risk']}")
            
            print()
            return data
            
        elif response.status_code == 422:
            print(f"❌ Validation Error (422): '{text[:30]}{'...' if len(text) > 30 else ''}'")
            print(f"   Response: {response.text}")
            print()
            return None
            
        else:
            print(f"❌ Error {response.status_code}: '{text[:30]}{'...' if len(text) > 30 else ''}'")
            print(f"   Response: {response.text}")
            print()
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Is the HealWise backend running on http://127.0.0.1:8000?")
        return None
    except Exception as e:
        print(f"❌ Exception for '{text[:30]}{'...' if len(text) > 30 else ''}': {e}")
        return None

def test_empty_input():
    """Test validation for empty input per copilot instructions"""
    print("🚫 Testing Empty Input Validation:")
    print("-" * 35)
    
    empty_cases = ["", "   ", "\n\t"]
    
    for case in empty_cases:
        response = requests.post(
            "http://127.0.0.1:8000/analyze",
            json={"text": case},
            timeout=10
        )
        if response.status_code == 422:
            print(f"✅ Correctly rejected empty input: '{repr(case)}'")
        else:
            print(f"⚠️  Empty input not rejected: '{repr(case)}' -> {response.status_code}")
    print()

def run_comprehensive_tests():
    """Run all test categories following copilot-instructions.md"""
    print("🧠 HealWise Comprehensive Bot Testing")
    print("=" * 50)
    print("Testing mental health text analysis with emotions + risk assessment")
    print()
    
    # Test categories mapped to prompts
    test_categories = {
        "easy": (EASY_PROMPTS, "Positive emotions and mild concerns"),
        "normal": (NORMAL_PROMPTS, "Work/relationship stress and emotional processing"), 
        "difficult": (DIFFICULT_PROMPTS, "High distress and crisis patterns"),
        "complex": (COMPLEX_PROMPTS, "Mixed emotions and ambiguous intent"),
        "edge_cases": (EDGE_CASES, "Edge cases and contract validation")
    }
    
    for category, (prompts, description) in test_categories.items():
        print(f"📊 Testing {category.upper()} scenarios:")
        print(f"   {description}")
        print("-" * 40)
        
        for prompt in prompts:
            if prompt:  # Skip empty strings in normal flow
                result = test_healwise_conversation(prompt)
                time.sleep(0.1)  # Rate limiting

def test_risk_escalation():
    """Test risk assessment accuracy per HealWise Risk enum (SAFE/LOW/MODERATE/HIGH/CRISIS)"""
    print("🚨 Testing Risk Assessment Accuracy:")
    print("-" * 40)
    print("Validating emotion → risk → actions pipeline")
    print()
    
    risk_tests = [
        ("I'm feeling fantastic and everything is going well!", ["SAFE", "LOW"]),
        ("I'm a bit stressed about my upcoming presentation.", ["SAFE", "LOW", "MODERATE"]), 
        ("I feel hopeless and overwhelmed with everything.", ["MODERATE", "HIGH"]),
        ("I want to hurt myself and can't take this anymore.", ["HIGH", "CRISIS"]),
        ("I have specific plans to end my life tonight.", ["CRISIS"])
    ]
    
    for text, expected_risks in risk_tests:
        result = test_healwise_conversation(text)
        if result:
            actual_risk = result["risk"]
            if actual_risk in expected_risks:
                print(f"✅ Correct risk assessment: {actual_risk} for crisis level")
            else:
                print(f"⚠️  Risk assessment review needed:")
                print(f"    Expected: {expected_risks}")
                print(f"    Got: {actual_risk}")
                print(f"    Text: '{text}'")
        print()

def test_contract_compliance():
    """Test API contract per copilot-instructions.md"""
    print("📋 Testing API Contract Compliance:")
    print("-" * 35)
    
    # Test the exact contract example from copilot-instructions.md
    contract_example = "I'm overwhelmed"
    result = test_healwise_conversation(contract_example)
    
    if result:
        print("✅ Contract validation:")
        print(f"   ✓ probs: {type(result['probs'])} with {len(result['probs'])} emotions")
        print(f"   ✓ risk: {type(result['risk'])} = '{result['risk']}'")
        print(f"   ✓ supportive_message: {type(result['supportive_message'])}")
        print(f"   ✓ suggested_next_steps: {type(result['suggested_next_steps'])} with {len(result['suggested_next_steps'])} items")
        print(f"   ✓ helpful_resources: {type(result['helpful_resources'])} with {len(result['helpful_resources'])} items")
        
        # Validate emotion probabilities
        for emotion, prob in result['probs'].items():
            if not isinstance(prob, (int, float)) or not (0 <= prob <= 1):
                print(f"   ⚠️  Invalid probability: {emotion} = {prob}")
    print()

def test_health_endpoint():
    """Test health endpoint per copilot-instructions.md"""
    print("🏥 Testing Health Endpoint:")
    print("-" * 25)
    
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    print()

def test_cors_headers():
    """Test CORS configuration per copilot-instructions.md (allows localhost:5173)"""
    print("🌐 Testing CORS Configuration:")
    print("-" * 30)
    
    try:
        # Test OPTIONS preflight for Vite default port
        response = requests.options(
            "http://127.0.0.1:8000/analyze",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=10
        )
        
        if response.status_code in [200, 204]:
            print("✅ CORS preflight successful for localhost:5173")
            if "Access-Control-Allow-Origin" in response.headers:
                print(f"   ✓ Allowed origin: {response.headers['Access-Control-Allow-Origin']}")
        else:
            print(f"⚠️  CORS preflight issue: {response.status_code}")
            
    except Exception as e:
        print(f"❌ CORS test error: {e}")
    print()

def test_ollama_mistral_availability():
    """Test if Ollama with mistral:latest is available"""
    print("🤖 Testing Ollama mistral:latest Integration:")
    print("-" * 45)
    
    try:
        # Test if Ollama is installed
        result = subprocess.run(["ollama", "--version"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ Ollama installed: {result.stdout.strip()}")
        else:
            print("❌ Ollama not found")
            return False
            
    except FileNotFoundError:
        print("❌ Ollama not installed. Install from https://ollama.ai")
        print("   Then run: ollama pull mistral:latest")
        return False
    except Exception as e:
        print(f"❌ Ollama check failed: {e}")
        return False
    
    try:
        # Test if mistral:latest model is available
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=10)
        if "mistral:latest" in result.stdout or "mistral" in result.stdout:
            print("✅ mistral:latest model available")
        else:
            print("❌ mistral:latest model not found")
            print("   Run: ollama pull mistral:latest")
            return False
            
    except Exception as e:
        print(f"❌ Model check failed: {e}")
        return False
    
    try:
        # Test actual model inference
        test_prompt = "Respond with only the word SAFE"
        result = subprocess.run([
            "ollama", "run", "mistral:latest"
        ], 
        input=test_prompt, 
        text=True, 
        capture_output=True, 
        timeout=30
        )
        
        if result.returncode == 0 and "SAFE" in result.stdout.upper():
            print("✅ mistral:latest inference working")
            return True
        else:
            print(f"⚠️  mistral:latest response issue: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  mistral:latest timeout (30s) - model may be slow")
        return False
    except Exception as e:
        print(f"❌ Inference test failed: {e}")
        return False

def test_risk_assessment_with_mistral():
    """Test risk assessment using mistral:latest via HealWise API"""
    print("\n🧠 Testing Risk Assessment with mistral:latest:")
    print("-" * 50)
    
    # Test cases specifically for LLM reasoning
    llm_test_cases = [
        ("I'm having a wonderful day and everything is perfect!", ["SAFE", "LOW"]),
        ("I feel completely hopeless and don't see any point in continuing.", ["MODERATE", "HIGH"]),
        ("I want to hurt myself and have been thinking about it constantly.", ["HIGH", "CRISIS"]),
        ("I have detailed plans to end my life tonight.", ["CRISIS"])
    ]
    
    for text, expected_risks in llm_test_cases:
        try:
            response = requests.post(
                "http://127.0.0.1:8000/analyze",
                json={"text": text},
                timeout=60  # Longer timeout for LLM calls
            )
            
            if response.status_code == 200:
                data = response.json()
                risk = data["risk"]
                
                if risk in expected_risks:
                    print(f"✅ '{text[:40]}...'")
                    print(f"   Risk: {risk} (expected: {expected_risks})")
                else:
                    print(f"⚠️  '{text[:40]}...'")
                    print(f"   Risk: {risk} (expected: {expected_risks})")
                    print(f"   Note: LLM reasoning may vary, check if reasonable")
            else:
                print(f"❌ API error {response.status_code}: {text[:30]}...")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
        
        print()

def main():
    """Main test runner"""
    print("🚀 Starting HealWise Bot Validation")
    print("Following copilot-instructions.md for mental health text analysis")
    print("=" * 60)
    print()
    
    # Check if backend is running
    try:
        health_response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Backend health check failed. Please start the backend:")
            print("   cd backend && uvicorn app:app --reload")
            return
    except:
        print("❌ Cannot connect to backend. Please start it first:")
        print("   cd backend && uvicorn app:app --reload")
        return
    
    print("✅ Backend is running. Starting comprehensive tests...\n")
    
    # Run all test suites
    test_health_endpoint()
    test_cors_headers() 
    test_empty_input()
    test_contract_compliance()
    run_comprehensive_tests()
    test_risk_escalation()
    
    # Test Ollama integration
    ollama_ready = test_ollama_mistral_availability()
    
    if ollama_ready:
        print("\n✅ Ollama mistral:latest is ready!")
        print("You can now run the full HealWise test suite with LLM reasoning.")
        
        # Test integration if backend is running
        try:
            health_check = requests.get("http://127.0.0.1:8000/health", timeout=5)
            if health_check.status_code == 200:
                test_risk_assessment_with_mistral()
        except:
            print("\n💡 Start the HealWise backend to test LLM integration:")
            print("   cd backend && uvicorn app:app --reload")
    else:
        print("\n❌ Ollama mistral:latest setup incomplete")
        print("Setup steps:")
        print("1. Install Ollama: https://ollama.ai")
        print("2. Pull model: ollama pull mistral:latest")
        print("3. Test: ollama run mistral:latest")
    
    print("🎯 Testing Complete!")
    print("=" * 50)
    print("Review the outputs above to validate:")
    print("✓ Emotion detection accuracy (SamLowe/roberta-base-go_emotions)")
    print("✓ Risk assessment appropriateness (SAFE/LOW/MODERATE/HIGH/CRISIS)")
    print("✓ Supportive message quality (de_stigmatize)")
    print("✓ Action relevance (ACTIONS from ladder)")
    print("✓ Resource helpfulness (kb.retrieve)")
    print("✓ API contract compliance")
    print("✓ CORS configuration for frontend")

if __name__ == "__main__":
    main()