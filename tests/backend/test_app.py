"""
Comprehensive tests for FastAPI backend endpoints
"""
import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

def test_health_endpoint(fastapi_client):
    """Test health check endpoint"""
    response = fastapi_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_analyze_endpoint_basic(fastapi_client, sample_user_text):
    """Test basic analyze endpoint functionality"""
    response = fastapi_client.post("/analyze", json={"text": sample_user_text["positive"]})
    
    assert response.status_code == 200
    data = response.json()
    
    # Check required fields
    required_fields = ["probs", "risk", "supportive_message", "suggested_next_steps", "helpful_resources"]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"
    
    # Check data types
    assert isinstance(data["probs"], dict)
    assert isinstance(data["risk"], str)
    assert isinstance(data["supportive_message"], str)
    assert isinstance(data["suggested_next_steps"], list)
    assert isinstance(data["helpful_resources"], list)

@pytest.mark.parametrize("text_type", ["positive", "negative", "neutral", "mixed"])
def test_analyze_different_emotions(fastapi_client, sample_user_text, text_type):
    """Test analyze endpoint with different emotional content"""
    response = fastapi_client.post("/analyze", json={"text": sample_user_text[text_type]})
    
    assert response.status_code == 200
    data = response.json()
    
    # Should have emotion probabilities
    assert len(data["probs"]) > 0
    
    # Probabilities should be valid
    for emotion, prob in data["probs"].items():
        assert 0 <= prob <= 1, f"Invalid probability for {emotion}: {prob}"

def test_analyze_empty_text(fastapi_client):
    """Test analyze endpoint with empty text"""
    response = fastapi_client.post("/analyze", json={"text": ""})
    
    # Should return 422 for empty text
    assert response.status_code == 422

def test_analyze_very_long_text(fastapi_client, sample_user_text):
    """Test analyze endpoint with very long text"""
    response = fastapi_client.post("/analyze", json={"text": sample_user_text["long"]})
    
    assert response.status_code == 200
    data = response.json()
    assert "probs" in data

def test_analyze_with_user_profile(fastapi_client, sample_user_text, sample_user_profile):
    """Test analyze endpoint with user profile header"""
    headers = {"X-User-Profile": json.dumps(sample_user_profile)}
    response = fastapi_client.post(
        "/analyze", 
        json={"text": sample_user_text["positive"]},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "supportive_message" in data

def test_analyze_invalid_json_profile(fastapi_client, sample_user_text):
    """Test analyze endpoint with invalid JSON in user profile"""
    headers = {"X-User-Profile": "{invalid json}"}
    response = fastapi_client.post(
        "/analyze", 
        json={"text": sample_user_text["positive"]},
        headers=headers
    )
    
    # Should still work, just ignore invalid profile
    assert response.status_code == 200

def test_analyze_malformed_request(fastapi_client):
    """Test analyze endpoint with malformed requests"""
    test_cases = [
        {},  # Missing text field
        {"wrong_field": "value"},  # Wrong field name
        {"text": None},  # Null text
        {"text": 123},  # Non-string text
    ]
    
    for case in test_cases:
        response = fastapi_client.post("/analyze", json=case)
        assert response.status_code == 422, f"Should reject malformed request: {case}"

@pytest.mark.slow
def test_analyze_concurrent_requests(fastapi_client, sample_user_text):
    """Test multiple concurrent requests"""
    import concurrent.futures
    
    def make_request():
        return fastapi_client.post("/analyze", json={"text": sample_user_text["positive"]})
    
    # Make 10 concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        responses = [future.result() for future in futures]
    
    # All should succeed
    for response in responses:
        assert response.status_code == 200

def test_cors_headers(fastapi_client):
    """Test CORS headers are present"""
    response = fastapi_client.options("/analyze")
    assert "access-control-allow-origin" in response.headers

@patch('models.mental_classifier.score_probs')
def test_analyze_model_error_handling(mock_score_probs, fastapi_client, sample_user_text):
    """Test error handling when model fails"""
    mock_score_probs.side_effect = Exception("Model error")
    
    response = fastapi_client.post("/analyze", json={"text": sample_user_text["positive"]})
    
    # Should return error but not crash
    assert response.status_code == 500

def test_hello_world():
    assert 1 + 1 == 2