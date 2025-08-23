"""
Global pytest configuration following HealWise architecture
Per copilot-instructions.md: app.py mutates sys.path to import safety, kb, utils from repo root
"""
import sys
import os
import pytest
from unittest.mock import Mock, patch
from typing import Dict, Any

# Follow HealWise sys.path pattern from app.py
repo_root = os.path.dirname(__file__)
backend_path = os.path.join(repo_root, 'backend')

# Add paths following HealWise import conventions
for path in [repo_root, backend_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

@pytest.fixture
def sample_user_text():
    """Sample user inputs for HealWise contract testing"""
    return {
        "positive": "I'm feeling wonderful today and accomplished so much!",
        "negative": "I'm overwhelmed and struggling with everything",
        "crisis": "I can't take this anymore and want to end it all", 
        "neutral": "Just another regular day at work",
        "empty": "",
        # Additional variants used by parametrized tests
        "mixed": "I'm grateful for my friends but still anxious about work",
        "long": " ".join([
            "Today was challenging but I kept going and tried my best",
            "I handled multiple tasks, felt a bit stressed, yet also proud",
            "Taking small steps forward and reflecting on what went well",
        ]) * 5,
        "contract_example": "I'm overwhelmed",  # From copilot-instructions.md
    }

@pytest.fixture
def sample_emotion_probs():
    """Sample emotion→prob dicts per SamLowe/roberta-base-go_emotions"""
    return {
        "positive": {"joy": 0.85, "optimism": 0.72, "excitement": 0.68},
        "negative": {"sadness": 0.89, "disappointment": 0.76, "fear": 0.65},
        "crisis": {"sadness": 0.95, "fear": 0.88, "anger": 0.72},
        "neutral": {"neutral": 0.78, "realization": 0.34}
    }

@pytest.fixture
def fastapi_client():
    """FastAPI TestClient following HealWise backend structure"""
    try:
        from fastapi.testclient import TestClient
        from app import app
        return TestClient(app)
    except ImportError as e:
        pytest.skip(f"FastAPI backend not available: {e}")

@pytest.fixture
def healwise_risk_levels():
    """Risk levels per copilot-instructions.md: assessor.Risk enum"""
    return ["SAFE", "LOW", "MODERATE", "HIGH", "CRISIS"]

@pytest.fixture
def sample_risk_levels():
    """Dict of assessor.Risk values for tests expecting a mapping"""
    return {
        "SAFE": "SAFE",
        "LOW": "LOW",
        "MODERATE": "MODERATE",
        "HIGH": "HIGH",
        "CRISIS": "CRISIS",
    }

@pytest.fixture
def sample_user_profile():
    """Sample user profile header payload for personalization tests"""
    return {
        "name": "Alex",
        "botPersona": "friend",
        "personality": "creative",
        "preferences": {"tone": "gentle", "length": "short"}
    }

@pytest.fixture
def sample_kb_files(tmp_path):
    """Create sample .md files following HealWise kb/ structure"""
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    
    # Sample .md files per instructions
    files = {
        "anxiety.md": "# Anxiety Management\nTechniques for managing anxiety...",
        "depression.md": "# Depression Support\nResources for depression...", 
        "crisis.md": "# Crisis Resources\nEmergency contacts and support..."
    }
    
    for filename, content in files.items():
        (kb_dir / filename).write_text(content)
    
    return kb_dir