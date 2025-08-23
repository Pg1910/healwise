"""
Integration tests for complete HealWise pipeline
"""
import pytest
from fastapi.testclient import TestClient
import json

@pytest.mark.integration
def test_complete_analysis_pipeline(fastapi_client, sample_user_text, sample_user_profile):
    """Test complete analysis from input to output"""
    headers = {"X-User-Profile": json.dumps(sample_user_profile)}
    
    response = fastapi_client.post(
        "/analyze",
        json={"text": sample_user_text["negative"]},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify complete response structure
    assert "probs" in data
    assert "risk" in data
    assert "supportive_message" in data
    assert "suggested_next_steps" in data
    assert "helpful_resources" in data
    
    # Verify risk assessment makes sense for negative input
    assert data["risk"] in ["SAFE", "LOW", "MODERATE", "HIGH", "CRISIS"]
    
    # Verify supportive message is personalized
    assert len(data["supportive_message"]) > 0
    
    # Verify suggested actions are provided
    assert len(data["suggested_next_steps"]) > 0
    
    # Verify helpful resources are provided
    assert len(data["helpful_resources"]) > 0

@pytest.mark.integration
def test_crisis_detection_flow(fastapi_client):
    """Test crisis detection and response flow"""
    crisis_text = "I can't take this anymore and want to end my life"
    
    response = fastapi_client.post("/analyze", json={"text": crisis_text})
    
    assert response.status_code == 200
    data = response.json()
    
    # Should detect high risk
    assert data["risk"] in ["HIGH", "CRISIS"]
    
    # Should provide crisis resources
    resources_text = " ".join(data["helpful_resources"]).lower()
    assert any(term in resources_text for term in ["crisis", "emergency", "988", "help"])
    
    # Should have immediate action steps
    next_steps_text = " ".join(data["suggested_next_steps"]).lower()
    assert any(term in next_steps_text for term in ["call", "contact", "immediate", "help"])

@pytest.mark.integration
def test_positive_mood_flow(fastapi_client):
    """Test positive mood detection and encouragement"""
    positive_text = "I'm feeling fantastic today and accomplished so much!"
    
    response = fastapi_client.post("/analyze", json={"text": positive_text})
    
    assert response.status_code == 200
    data = response.json()
    
    # Should detect low/safe risk
    assert data["risk"] in ["SAFE", "LOW"]
    
    # Should have encouraging message
    message = data["supportive_message"].lower()
    assert any(word in message for word in ["great", "wonderful", "keep", "continue", "celebrate"])