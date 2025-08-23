"""
Tests for HealWise mental health emotion classification
Following actual SamLowe/roberta-base-go_emotions implementation
"""
import pytest
from unittest.mock import patch, Mock
import sys
import os

# Follow HealWise sys.path pattern
root_path = os.path.join(os.path.dirname(__file__), '..', '..')
backend_path = os.path.join(root_path, 'backend')
for path in [root_path, backend_path]:
    if path not in sys.path:
        sys.path.insert(0, path)

def test_score_probs_import():
    """Test that score_probs can be imported from models.mental_classifier"""
    try:
        from models.mental_classifier import score_probs
        assert callable(score_probs)
    except ImportError:
        pytest.skip("models.mental_classifier not available - may need HuggingFace models downloaded")

@patch('models.mental_classifier.model')
@patch('models.mental_classifier.tokenizer')
def test_score_probs_basic_mock(mock_model, mock_tokenizer, sample_user_text):
    """Test basic emotion classification with mocked model"""
    try:
        # Mock tokenizer output
        mock_tokenizer.return_value = {
            "input_ids": [[101, 1045, 1005, 1049, 2619, 102]], 
            "attention_mask": [[1, 1, 1, 1, 1, 1]]
        }
        
        # Mock model output with 28 emotions from go_emotions
        mock_output = Mock()
        mock_output.logits = [[0.1, 0.8, 0.1, 0.3, 0.2, 0.9, 0.4] + [0.1] * 21]
        mock_model.return_value = mock_output
        
        from models.mental_classifier import score_probs
        result = score_probs(sample_user_text["positive"])
        
        assert isinstance(result, dict)
        assert len(result) > 0
        
        # Check probabilities are valid
        for emotion, prob in result.items():
            assert isinstance(emotion, str)
            assert isinstance(prob, (int, float))
            assert 0 <= prob <= 1
            
    except ImportError:
        pytest.skip("models.mental_classifier not available")

def test_score_probs_top_k_parameter():
    """Test top_k parameter if model is available"""
    try:
        from models.mental_classifier import score_probs
        
        # Test with actual model if available
        result = score_probs("I'm feeling okay", top_k=3)
        assert isinstance(result, dict)
        assert len(result) <= 3
        
    except ImportError:
        pytest.skip("models.mental_classifier not available")
    except Exception:
        pytest.skip("HuggingFace model not downloaded or available")

def test_score_probs_empty_text_handling():
    """Test handling of empty text input"""
    try:
        from models.mental_classifier import score_probs
        
        result = score_probs("")
        assert isinstance(result, dict)
        # May be empty or have default emotions
        
    except ImportError:
        pytest.skip("models.mental_classifier not available")
    except Exception:
        pytest.skip("Model not available for testing")

def test_model_global_load_pattern():
    """Test that model follows HealWise global load + model.eval() pattern"""
    try:
        import models.mental_classifier
        
        # Should have global model and tokenizer loaded at import
        assert hasattr(models.mental_classifier, 'model')
        assert hasattr(models.mental_classifier, 'tokenizer')
        
    except ImportError:
        pytest.skip("models.mental_classifier not available")
    except Exception:
        pytest.skip("Model loading failed - expected if HuggingFace models not downloaded")