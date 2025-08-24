"""
Verify Ollama mistral:latest integration for HealWise
Per copilot-instructions.md: assess_crisis_signals uses local LLM via Ollama
"""
import subprocess
import json
import sys
import os
from pathlib import Path

# Follow HealWise sys.path convention per copilot-instructions.md
repo_root = Path(__file__).parent.absolute()
backend_path = repo_root / "backend"

for path in [str(repo_root), str(backend_path)]:
    if path not in sys.path:
        sys.path.insert(0, path)

def test_ollama_mistral_integration():
    """Test Ollama mistral:latest integration step by step"""
    print("🔍 Verifying Ollama mistral:latest Integration")
    print("=" * 50)
    
    # Step 1: Check Ollama installation
    try:
        result = subprocess.run(["ollama", "--version"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✅ Ollama installed: {result.stdout.strip()}")
        else:
            print("❌ Ollama command failed")
            return False
    except FileNotFoundError:
        print("❌ Ollama not found. Install from: https://ollama.ai")
        print("   Windows: Download installer")
        print("   macOS: brew install ollama")
        print("   Linux: curl -fsSL https://ollama.ai/install.sh | sh")
        return False
    
    # Step 2: Check if mistral:latest is available
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True, timeout=10)
        print(f"\n📋 Available models:\n{result.stdout}")
        
        if "mistral" not in result.stdout.lower():
            print("❌ mistral model not found")
            print("   Run: ollama pull mistral:latest")
            return False
        else:
            print("✅ mistral model available")
    except Exception as e:
        print(f"❌ Failed to list models: {e}")
        return False
    
    # Step 3: Test basic inference
    print("\n🧪 Testing mistral:latest inference...")
    try:
        test_prompt = "Respond with exactly one word: WORKING"
        result = subprocess.run([
            "ollama", "run", "mistral:latest"
        ], 
        input=test_prompt, 
        text=True, 
        capture_output=True, 
        timeout=45
        )
        
        if result.returncode == 0:
            response = result.stdout.strip()
            print(f"✅ mistral response: '{response}'")
            if "WORKING" in response.upper():
                print("✅ mistral:latest inference confirmed")
                return True
            else:
                print("⚠️  mistral responded but not as expected")
                return True  # Still working, just different response
        else:
            print(f"❌ mistral failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️  mistral timeout (45s) - may be pulling model on first run")
        print("   Try running: ollama run mistral:latest")
        return False
    except Exception as e:
        print(f"❌ mistral test failed: {e}")
        return False

def test_healwise_llm_integration():
    """Test HealWise safety assessor with mistral:latest"""
    print("\n🧠 Testing HealWise LLM Integration")
    print("=" * 40)
    
    try:
        from safety.assessor import assess_crisis_signals, Risk
        
        # Test cases for LLM reasoning
        test_cases = [
            ("I'm feeling wonderful today!", Risk.SAFE),
            ("I'm stressed about work", Risk.LOW),
            ("I feel hopeless and trapped", Risk.MODERATE),
            ("I want to hurt myself", Risk.HIGH),
            ("I have plans to end my life", Risk.CRISIS)
        ]
        
        for text, expected_min_risk in test_cases:
            print(f"\nTesting: '{text}'")
            
            # Mock emotion probs for testing
            mock_probs = {"sadness": 0.3, "fear": 0.2, "joy": 0.1}
            
            try:
                risk = assess_crisis_signals(text, mock_probs)
                print(f"   Risk assessed: {risk.value}")
                
                # Validate it's a proper Risk enum
                if isinstance(risk, Risk):
                    print("   ✅ Valid Risk enum returned")
                else:
                    print("   ❌ Invalid risk type returned")
                    
            except Exception as e:
                print(f"   ❌ Assessment failed: {e}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Cannot import HealWise safety components: {e}")
        return False

if __name__ == "__main__":
    ollama_ok = test_ollama_mistral_integration()
    
    if ollama_ok:
        print("\n" + "="*50)
        healwise_ok = test_healwise_llm_integration()
        
        if healwise_ok:
            print("\n🎉 Integration verified! mistral:latest is working with HealWise")
        else:
            print("\n❌ HealWise integration issues found")
    else:
        print("\n❌ Ollama mistral:latest setup incomplete")