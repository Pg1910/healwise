"""
Tests for HealWise pattern analyzer following copilot-instructions.md
New models under backend/models/ per extension points
"""
import pytest
import sys
import os

# Follow HealWise sys.path pattern
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
backend_path = os.path.join(repo_root, 'backend')
for path in [repo_root, backend_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

def test_analyze_conversation_patterns_basic():
    """Test basic pattern analysis functionality"""
    try:
        from backend.models.pattern_analyzer import analyze_conversation_patterns
        
        # Test with various inputs
        test_cases = [
            ("I keep having the same problems again", {"repetitive_concerns": True}),
            ("Things are getting worse and worse", {"escalating_risk": True}),
            ("I'm feeling better and making progress", {"improvement_indicators": True}),
            ("Hi", {"engagement_level": "low"}),
            ("", {"engagement_level": "medium"}),  # Default case
        ]
        
        for text, expected_patterns in test_cases:
            result = analyze_conversation_patterns(text)
            assert isinstance(result, dict)
            
            for key, expected_value in expected_patterns.items():
                assert result[key] == expected_value, f"Expected {key}={expected_value} for text: '{text}'"
                
    except ImportError:
        pytest.skip("pattern_analyzer not available")

def test_get_conversation_insights():
    """Test conversation insights generation"""
    try:
        from backend.models.pattern_analyzer import get_conversation_insights
        
        # Test with different pattern combinations
        patterns = {
            "repetitive_concerns": True,
            "escalating_risk": False,
            "improvement_indicators": False,
            "engagement_level": "low"
        }
        
        insights = get_conversation_insights(patterns)
        assert isinstance(insights, dict)
        assert "summary" in insights
        assert "recommendations" in insights
        assert "flags" in insights
        
        # Should flag repetitive concerns
        assert "repetitive_concerns" in insights["flags"]
        assert any("coping strategies" in rec for rec in insights["recommendations"])
        
    except ImportError:
        pytest.skip("pattern_analyzer not available")

def test_pattern_analyzer_integration_with_risk():
    """Test pattern analyzer integration with risk assessment"""
    try:
        from backend.models.pattern_analyzer import analyze_conversation_patterns, get_conversation_insights
        
        # Test high-risk pattern detection
        high_risk_text = "I can't handle this anymore, it's getting worse every day"
        patterns = analyze_conversation_patterns(high_risk_text)
        insights = get_conversation_insights(patterns, risk_level="HIGH")
        
        assert patterns["escalating_risk"] == True
        assert "escalating_risk" in insights["flags"]
        
    except ImportError:
        pytest.skip("pattern_analyzer not available")

def test_pattern_analyzer_empty_input():
    """Test pattern analyzer handles empty/invalid input"""
    try:
        from backend.models.pattern_analyzer import analyze_conversation_patterns, get_conversation_insights
        
        # Test empty string
        patterns = analyze_conversation_patterns("")
        assert isinstance(patterns, dict)
        assert patterns["repetitive_concerns"] == False
        assert patterns["escalating_risk"] == False
        
        # Test None input
        patterns = analyze_conversation_patterns(None)
        assert isinstance(patterns, dict)
        
        # Test insights with empty patterns
        insights = get_conversation_insights({})
        assert isinstance(insights, dict)
        
    except ImportError:
        pytest.skip("pattern_analyzer not available")