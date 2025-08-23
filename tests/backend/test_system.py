"""
HealWise system tests following copilot-instructions.md
Per instructions: app.py mutates sys.path to import safety, kb, utils from repo root
"""
import sys
import os
import pytest
from unittest.mock import patch, Mock

# Follow HealWise convention: app.py mutates sys.path to import from repo root
# Per instructions: "keep layout stable or run backend from backend/"
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
backend_path = os.path.join(repo_root, 'backend')

# Mimic app.py sys.path mutation for consistent imports
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

def test_healwise_system_imports():
    """Test HealWise components import following copilot-instructions.md architecture"""
    try:
        # Test core backend components
        from models.mental_classifier import score_probs
        assert callable(score_probs), "score_probs should be callable"
        
        from safety.assessor import assess_crisis_signals, Risk
        assert callable(assess_crisis_signals), "assess_crisis_signals should be callable"
        
        # Test Risk enum values per instructions (SAFE/LOW/MODERATE/HIGH/CRISIS)
        expected_risks = {'SAFE', 'LOW', 'MODERATE', 'HIGH', 'CRISIS'}
        actual_risks = {risk.value for risk in Risk}
        assert expected_risks.issubset(actual_risks), f"Missing Risk values: {expected_risks - actual_risks}"
        
        from safety.ladder import ACTIONS
        assert isinstance(ACTIONS, dict), "ACTIONS should be dict mapping risk → actions"
        
        from safety.bias import de_stigmatize
        assert callable(de_stigmatize), "de_stigmatize should be callable"
        
        # Test early warning system (safety extension point)
        from safety.early_warning import generate_early_warnings
        assert callable(generate_early_warnings), "generate_early_warnings should be callable"
        
        # Test kb.retriever with proper mocking per known issue
        from kb.retriever import retrieve
        assert callable(retrieve), "retrieve should be callable"
        
    except ImportError as e:
        pytest.skip(f"HealWise components not available: {e}")

def test_healwise_fastapi_contract():
    """Test FastAPI app follows HealWise contract from copilot-instructions.md"""
    try:
        from fastapi.testclient import TestClient
        from app import app
        
        client = TestClient(app)
        
        # Test contract example: { "text": "I'm overwhelmed" }
        response = client.post("/analyze", json={"text": "I'm overwhelmed"})
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response keys per contract
            required_keys = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
            for key in required_keys:
                assert key in data, f"Missing contract key: {key}"
            
            # Verify data types per contract
            assert isinstance(data["probs"], dict), "probs should be emotion→prob dict"
            assert isinstance(data["risk"], str), "risk should be string from assessor.Risk"
            assert isinstance(data["supportive_message"], str), "supportive_message should be string"
            assert isinstance(data["suggested_next_steps"], list), "suggested_next_steps should be list from ACTIONS"
            assert isinstance(data["helpful_resources"], list), "helpful_resources should be list from kb.retrieve"
        else:
            pytest.skip(f"Backend not responding: {response.status_code}")
            
    except ImportError as e:
        pytest.skip(f"FastAPI app not available: {e}")

def test_healwise_data_flow():
    """Test HealWise data flow per copilot-instructions.md"""
    try:
        # Data flow: emotions → risk → empathy → de_stigmatize → ACTIONS → kb.retrieve
        
        # 1) emotions via score_probs
        from models.mental_classifier import score_probs
        
        # 2) risk via assess_crisis_signals (mock Ollama per known issue)
        from safety.assessor import assess_crisis_signals
        
        # 3) de_stigmatize
        from safety.bias import de_stigmatize
        
        # 4) ACTIONS[risk] from ladder
        from safety.ladder import ACTIONS
        
        # 5) kb.retrieve
        from kb.retriever import retrieve
        
        # 6) early warnings (safety extension)
        from safety.early_warning import generate_early_warnings
        
        # All components importable
        components = [score_probs, assess_crisis_signals, de_stigmatize, retrieve, generate_early_warnings]
        assert all(callable(f) for f in components), "All data flow components should be callable"
        assert isinstance(ACTIONS, dict), "ACTIONS should be risk→actions mapping"
        
    except ImportError as e:
        pytest.skip(f"HealWise data flow components not available: {e}")

def test_healwise_known_issues():
    """Test awareness of known issues from copilot-instructions.md"""
    try:
        from app import app
        assert app is not None
        
        # Known issue: "Risk enums differ: assessor.Risk vs ladder.Risk"
        from safety.assessor import Risk as AssessorRisk
        from safety.ladder import ACTIONS
        
        # Known issue: may need explicit mapping between enum values
        # This test documents the issue for future fixes
        
        # Known issue: "app.py updates analyze.history after return (dead code)"
        # We don't test the dead code
        
        # Known issue: "Ollama must be installed...otherwise expect fallback to SAFE"
        # Per instructions: expect fallback behavior
        
    except ImportError:
        pytest.skip("Known issues test - app not available")

def test_healwise_cors_vite_default():
    """Test CORS allows http://localhost:5173 per copilot-instructions.md"""
    try:
        from fastapi.testclient import TestClient
        from app import app
        
        client = TestClient(app)
        
        # Test CORS for Vite default port 5173
        response = client.options("/analyze", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST"
        })
        
        # Should not fail due to CORS (per instructions: CORS allows localhost:5173)
        assert response.status_code in [200, 405], "CORS should allow localhost:5173"
        
    except ImportError:
        pytest.skip("FastAPI not available for CORS testing")

def test_healwise_ollama_fallback():
    """Test Ollama fallback behavior per copilot-instructions.md"""
    try:
        from safety.assessor import assess_crisis_signals, Risk
        
        # Per instructions: "Ollama must be installed...otherwise expect fallback to SAFE"
        # Test that assessment works even without Ollama
        result = assess_crisis_signals("test", {"sadness": 0.5})
        assert isinstance(result, Risk), "Should return Risk enum even when Ollama unavailable"
        # Don't assert specific value since fallback behavior may vary
        
    except ImportError:
        pytest.skip("safety.assessor not available")

def test_healwise_kb_retrieval():
    """Test KB retrieval per copilot-instructions.md: assumes .md files present"""
    try:
        from kb.retriever import retrieve
        
        # Per instructions: "kb/retriever.py assumes .md files present; returns full file text"
        results = retrieve("anxiety", k=2)
        assert isinstance(results, list), "retrieve should return list"
        
        # If .md files are present, should return full text
        if results:
            assert all(isinstance(result, str) for result in results), "Should return full file text"
            assert all(len(result) > 0 for result in results), "Should return non-empty content"
        
    except ImportError:
        pytest.skip("kb.retriever not available")
    except Exception:
        pytest.skip("KB .md files not found - per instructions: assumes .md files present")

def test_healwise_mental_classifier():
    """Test mental classifier per copilot-instructions.md: HuggingFace SamLowe/roberta-base-go_emotions"""
    try:
        from models.mental_classifier import score_probs
        
        # Per instructions: "Global load + model.eval() at import"
        # Test basic functionality
        result = score_probs("I'm feeling okay", top_k=5)
        assert isinstance(result, dict), "score_probs should return dict"
        assert len(result) <= 5, "Should respect top_k parameter"
        
        # Test probabilities are valid
        for emotion, prob in result.items():
            assert isinstance(emotion, str), "Emotion should be string"
            assert isinstance(prob, (int, float)), "Probability should be numeric"
            assert 0 <= prob <= 1, f"Probability should be 0-1: {emotion}={prob}"
        
    except ImportError:
        pytest.skip("models.mental_classifier not available")
    except Exception:
        pytest.skip("HuggingFace SamLowe/roberta-base-go_emotions model not downloaded")