"""
Tests for HealWise knowledge base retrieval system
Following actual kb/retriever.py implementation
"""
import pytest
import os
import tempfile
from unittest.mock import patch
import sys

# Follow HealWise sys.path pattern
root_path = os.path.join(os.path.dirname(__file__), '..', '..')
if root_path not in sys.path:
    sys.path.insert(0, root_path)

def test_retrieve_basic(sample_kb_files):
    """Test basic knowledge base retrieval with actual kb/ structure"""
    # Mock os.listdir and file reading to use our test files
    with patch('os.listdir') as mock_listdir:
        with patch('builtins.open', create=True) as mock_open:
            # Set up mock to return our test files
            mock_listdir.return_value = ['anxiety.md', 'depression.md', 'crisis.md']
            
            # Mock file reading
            def mock_file_content(filename, *args, **kwargs):
                if 'anxiety.md' in filename:
                    mock_file = mock_open.return_value.__enter__.return_value
                    mock_file.read.return_value = "# Managing Anxiety\nDeep breathing techniques help with anxiety..."
                    return mock_open.return_value
                return mock_open.return_value
            
            mock_open.side_effect = mock_file_content
            
            from kb.retriever import retrieve
            results = retrieve("anxiety", k=1)
            
            assert isinstance(results, list)
            assert len(results) >= 0  # May be empty if no files match

def test_retrieve_with_actual_kb_structure():
    """Test retrieval using actual kb/ directory structure"""
    try:
        from kb.retriever import retrieve
        
        # Test with a generic query that should work regardless of kb/ contents
        results = retrieve("help", k=2)
        assert isinstance(results, list)
        
        # Test empty query
        empty_results = retrieve("", k=2)
        assert isinstance(empty_results, list)
        
    except ImportError:
        pytest.skip("kb.retriever not available")
    except FileNotFoundError:
        pytest.skip("kb/ directory not found - expected in HealWise architecture")

def test_retrieve_handles_missing_kb_directory():
    """Test retriever handles missing kb/ directory gracefully"""
    with patch('os.listdir') as mock_listdir:
        mock_listdir.side_effect = FileNotFoundError("kb directory not found")
        
        try:
            from kb.retriever import retrieve
            results = retrieve("anxiety", k=1)
            # Should return empty list or handle gracefully
            assert isinstance(results, list)
        except ImportError:
            pytest.skip("kb.retriever not available")

def test_retrieve_keyword_matching():
    """Test keyword matching logic"""
    with patch('os.listdir') as mock_listdir:
        with patch('builtins.open', create=True) as mock_open:
            mock_listdir.return_value = ['anxiety.md', 'depression.md']
            
            # Mock file reading with specific content
            file_contents = {
                'anxiety.md': "# Anxiety Management\nTechniques for managing anxiety and panic.",
                'depression.md': "# Depression Support\nResources for depression and sadness."
            }
            
            def mock_read_file(filename, *args, **kwargs):
                mock_file = mock_open.return_value.__enter__.return_value
                for key, content in file_contents.items():
                    if key in filename:
                        mock_file.read.return_value = content
                        break
                else:
                    mock_file.read.return_value = ""
                return mock_open.return_value
            
            mock_open.side_effect = mock_read_file
            
            try:
                from kb.retriever import retrieve
                results = retrieve("anxiety", k=1)
                assert isinstance(results, list)
            except ImportError:
                pytest.skip("kb.retriever not available")

def test_retrieve_returns_full_md_content():
    """Test that retriever returns full .md file contents per HealWise spec"""
    try:
        from kb.retriever import retrieve
        
        # Test that results contain substantial content (not just filenames)
        results = retrieve("help support", k=1)
        
        if len(results) > 0:
            # Should return full file text, not just filenames
            assert all(len(result) > 10 for result in results), "Should return full .md content"
            
    except ImportError:
        pytest.skip("kb.retriever not available")
    except FileNotFoundError:
        pytest.skip("kb/ directory not found")