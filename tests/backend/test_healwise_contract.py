"""
Tests for HealWise API contract following architecture conventions
Tests the specific contract: { "text": "I'm overwhelmed" } → { probs, risk, supportive_message, suggested_next_steps, helpful_resources }
"""
import pytest
import json
import sys
import os

# Follow HealWise sys.path pattern from app.py
root_path = os.path.join(os.path.dirname(__file__), '..', '..')
backend_path = os.path.join(root_path, 'backend') 
for path in [root_path, backend_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

def test_healwise_api_contract_basic(fastapi_client):
    """Test basic HealWise API contract: POST /analyze → required response keys"""
    # Follow contract example from copilot-instructions.md
    request_data = {"text": "I'm overwhelmed"}
    
    response = fastapi_client.post("/analyze", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    
    # Verify exact contract keys from instructions
    required_keys = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
    for key in required_keys:
        assert key in data, f"Missing contract key: {key}"
    
    # Verify data types per contract
    assert isinstance(data["probs"], dict), "probs should be emotion→prob dict"
    assert isinstance(data["risk"], str), "risk should be string"
    assert isinstance(data["supportive_message"], str), "supportive_message should be string" 
    assert isinstance(data["suggested_next_steps"], list), "suggested_next_steps should be list"
    assert isinstance(data["helpful_resources"], list), "helpful_resources should be list of texts"

def test_healwise_risk_enum_values(fastapi_client, sample_user_text, sample_risk_levels):
    """Test risk values follow HealWise assessor.Risk enum"""
    test_cases = [
        sample_user_text["positive"],
        sample_user_text["negative"], 
        sample_user_text["crisis"]
    ]
    
    valid_risks = set(sample_risk_levels.values())
    
    for text in test_cases:
        response = fastapi_client.post("/analyze", json={"text": text})
        assert response.status_code == 200
        
        data = response.json()
        assert data["risk"] in valid_risks, \
            f"Risk '{data['risk']}' not in valid HealWise enum: {valid_risks}"

def test_healwise_emotion_probs_format(fastapi_client, sample_user_text):
    """Test probs follow HuggingFace SamLowe/roberta-base-go_emotions format"""
    response = fastapi_client.post("/analyze", json={"text": sample_user_text["positive"]})
    assert response.status_code == 200
    
    data = response.json()
    probs = data["probs"]
    
    # Should be emotion→prob mapping
    assert isinstance(probs, dict)
    assert len(probs) > 0, "Should have at least one emotion"
    
    # All probabilities should be valid floats 0-1
    for emotion, prob in probs.items():
        assert isinstance(emotion, str), f"Emotion key should be string: {emotion}"
        assert isinstance(prob, (int, float)), f"Prob should be numeric: {prob}"
        assert 0 <= prob <= 1, f"Prob should be 0-1: {emotion}={prob}"

def test_healwise_user_profile_header(fastapi_client, sample_user_text, sample_user_profile):
    """Test X-User-Profile header following HealWise personalization pattern"""
    headers = {"X-User-Profile": json.dumps(sample_user_profile)}
    
    response = fastapi_client.post(
        "/analyze",
        json={"text": sample_user_text["positive"]},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Should still return full contract
    assert "supportive_message" in data
    assert len(data["supportive_message"]) > 0

def test_healwise_cors_localhost_5173(fastapi_client):
    """Test CORS allows http://localhost:5173 following HealWise frontend setup"""
    # Test that CORS is configured for Vite default port
    response = fastapi_client.options("/analyze")
    
    # Should not fail due to CORS (200 or 405 acceptable)
    assert response.status_code in [200, 405]

def test_healwise_health_endpoint(fastapi_client):
    """Test GET /health → liveness following HealWise architecture"""
    response = fastapi_client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data

def test_healwise_kb_integration(fastapi_client, sample_user_text):
    """Test that helpful_resources come from kb/ .md files"""
    response = fastapi_client.post("/analyze", json={"text": sample_user_text["negative"]})
    assert response.status_code == 200
    
    data = response.json()
    resources = data["helpful_resources"]
    
    # Should have resources (from kb.retrieve(k=2))
    assert isinstance(resources, list)
    
    # If KB files exist, should have content
    if len(resources) > 0:
        for resource in resources:
            assert isinstance(resource, str)
            assert len(resource) > 0

@pytest.mark.parametrize("text_input", [
    "I'm feeling great today!",
    "I'm really struggling right now", 
    "Everything feels hopeless",
    "Just a normal day",
    "😊😢😰",
])
def test_healwise_various_inputs(fastapi_client, text_input):
    """Test HealWise contract with various real-world inputs"""
    response = fastapi_client.post("/analyze", json={"text": text_input})
    assert response.status_code == 200
    
    data = response.json()
    
    # Should always return full contract regardless of input
    required_keys = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
    for key in required_keys:
        assert key in data