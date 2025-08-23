"""
Tests for HealWise early warning system following copilot-instructions.md
Safety extension point for crisis prevention
"""
import pytest
import sys
import os

# Follow HealWise sys.path pattern per instructions
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
backend_path = os.path.join(repo_root, 'backend')
for path in [repo_root, backend_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

def test_generate_early_warnings_basic():
    """Test basic early warning generation"""
    try:
        from backend.safety.early_warning import generate_early_warnings
        from safety.assessor import Risk
        
        # Test crisis-level warnings
        probs = {"sadness": 0.9, "fear": 0.8}
        warnings = generate_early_warnings("I want to hurt myself", probs, Risk.CRISIS)
        assert isinstance(warnings, list)
        assert len(warnings) > 0
        assert any("crisis" in warning.lower() for warning in warnings)
        
        # Test safe content
        safe_probs = {"joy": 0.8, "optimism": 0.6}
        safe_warnings = generate_early_warnings("I'm feeling great!", safe_probs, Risk.SAFE)
        assert isinstance(safe_warnings, list)
        assert len(safe_warnings) == 0  # Should not generate warnings for safe content
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_assess_warning_urgency():
    """Test warning urgency assessment"""
    try:
        from backend.safety.early_warning import assess_warning_urgency
        from safety.assessor import Risk
        
        # Test critical urgency
        urgency = assess_warning_urgency(["Crisis detected"], Risk.CRISIS)
        assert urgency == "critical"
        
        # Test high urgency
        urgency = assess_warning_urgency(["Warning 1", "Warning 2"], Risk.HIGH)
        assert urgency == "high"
        
        # Test low urgency
        urgency = assess_warning_urgency([], Risk.SAFE)
        assert urgency == "low"
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_format_warnings_for_display():
    """Test warning formatting for frontend display"""
    try:
        from backend.safety.early_warning import format_warnings_for_display
        
        # Test with warnings
        warnings = ["Test warning message"]
        formatted = format_warnings_for_display(warnings, "medium")
        
        assert isinstance(formatted, dict)
        assert formatted["show_warnings"] == True
        assert "messages" in formatted
        assert "urgency" in formatted
        assert "color" in formatted
        assert "icon" in formatted
        
        # Test without warnings
        empty_formatted = format_warnings_for_display([], "low")
        assert empty_formatted["show_warnings"] == False
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_get_warning_resources():
    """Test resource generation based on warning types"""
    try:
        from backend.safety.early_warning import get_warning_resources
        
        # Test crisis resources
        crisis_warnings = ["Crisis indicators detected - emergency resources available"]
        resources = get_warning_resources(crisis_warnings)
        assert isinstance(resources, list)
        assert any("988" in resource for resource in resources)  # Suicide prevention lifeline
        
        # Test anxiety resources
        anxiety_warnings = ["Anxiety symptoms detected"]
        anxiety_resources = get_warning_resources(anxiety_warnings)
        assert isinstance(anxiety_resources, list)
        assert any("breathing" in resource.lower() for resource in anxiety_resources)
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_early_warning_emotion_integration():
    """Test early warning integration with emotion probabilities"""
    try:
        from backend.safety.early_warning import generate_early_warnings
        from safety.assessor import Risk
        
        # Test high sadness + fear combination
        high_distress_probs = {"sadness": 0.85, "fear": 0.8, "anxiety": 0.7}
        warnings = generate_early_warnings("I'm overwhelmed and scared", high_distress_probs, Risk.MODERATE)
        
        assert isinstance(warnings, list)
        assert len(warnings) > 0
        assert any("distress" in warning.lower() for warning in warnings)
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_early_warning_pattern_detection():
    """Test pattern-based warning detection"""
    try:
        from backend.safety.early_warning import generate_early_warnings
        from safety.assessor import Risk
        
        # Test isolation pattern
        isolation_text = "I'm completely alone and nobody cares about me"
        probs = {"sadness": 0.7}
        warnings = generate_early_warnings(isolation_text, probs, Risk.MODERATE)
        
        assert isinstance(warnings, list)
        assert any("isolation" in warning.lower() for warning in warnings)
        
        # Test hopelessness pattern
        hopeless_text = "Everything is hopeless and pointless"
        hopeless_warnings = generate_early_warnings(hopeless_text, probs, Risk.MODERATE)
        
        assert isinstance(hopeless_warnings, list)
        assert any("hopeless" in warning.lower() for warning in hopeless_warnings)
        
    except ImportError:
        pytest.skip("early warning system not available")

def test_early_warning_limits():
    """Test that early warnings are limited appropriately"""
    try:
        from backend.safety.early_warning import generate_early_warnings
        from safety.assessor import Risk
        
        # Generate text that would trigger many warnings
        multi_warning_text = "I'm hopeless, alone, can't sleep, drinking too much, want to hurt myself"
        probs = {"sadness": 0.9, "fear": 0.8, "anger": 0.7}
        warnings = generate_early_warnings(multi_warning_text, probs, Risk.HIGH)
        
        assert isinstance(warnings, list)
        assert len(warnings) <= 3  # Should limit to top 3 warnings
        
    except ImportError:
        pytest.skip("early warning system not available")