#!/usr/bin/env python3
import sys
import os
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_emotion_classifier():
    """Test the fixed emotion classifier directly"""
    print("🧪 Testing Fixed Emotion Classifier")
    print("=" * 50)
    
    try:
        from backend.models.mental_classifier import score_probs
        
        test_cases = [
            "I feel sad and lonely",
            "I'm really anxious about tomorrow", 
            "I'm feeling great today!",
            "I hate everything",
            "I'm so scared"
        ]
        
        for text in test_cases:
            print(f"\nInput: '{text}'")
            emotions = score_probs(text, top_k=3)
            print(f"Emotions: {emotions}")
            
    except Exception as e:
        print(f"❌ Error testing classifier: {e}")
        import traceback
        traceback.print_exc()

def test_data_structures():
    """Test the fixed JSON data structures"""
    print("\n\n📚 Testing Data Structures")
    print("=" * 50)
    
    data_files = [
        'backend/data/books.json',
        'backend/data/exercises.json', 
        'backend/data/nutrition.json',
        'backend/data/quotes.json'
    ]
    
    for file_path in data_files:
        try:
            print(f"\n📄 {file_path}:")
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Show structure for each risk level
            for risk_level in ['safe', 'low', 'moderate', 'high', 'crisis']:
                if risk_level in data:
                    items = data[risk_level]
                    print(f"  {risk_level}: {len(items)} items")
                    if items:
                        first_item = items[0]
                        if isinstance(first_item, dict):
                            print(f"    Structure: {list(first_item.keys())}")
                        else:
                            print(f"    Type: {type(first_item)}")
                            
        except Exception as e:
            print(f"  ❌ Error: {e}")

def test_content_loader():
    """Test ContentLoader service"""
    print("\n\n🔧 Testing ContentLoader Service")
    print("=" * 50)
    
    try:
        from backend.services.content_loader import ContentLoader
        
        loader = ContentLoader()
        print("✅ ContentLoader initialized")
        
        # Test loading data
        test_categories = ['books', 'exercises', 'nutrition', 'quotes']
        test_risk = 'moderate'
        
        for category in test_categories:
            try:
                data = loader.get_content(category, test_risk)
                print(f"  {category} ({test_risk}): {len(data) if data else 0} items")
                if data and len(data) > 0:
                    first_item = data[0] 
                    if isinstance(first_item, dict):
                        print(f"    Keys: {list(first_item.keys())}")
            except Exception as e:
                print(f"  ❌ {category}: {e}")
                
    except Exception as e:
        print(f"❌ Error testing ContentLoader: {e}")
        import traceback
        traceback.print_exc()

def test_recommendation_engine():
    """Test RecommendationEngine"""
    print("\n\n🎯 Testing RecommendationEngine")
    print("=" * 50)
    
    try:
        from backend.services.recommendation_engine import RecommendationEngine
        
        engine = RecommendationEngine()
        print("✅ RecommendationEngine initialized")
        
        # Test recommendations
        test_emotions = {'sadness': 0.8, 'disappointment': 0.2}
        test_risk = 'moderate'
        
        recommendations = engine.get_personalized_recommendations(
            emotions=test_emotions,
            risk_level=test_risk,
            user_text="I feel sad"
        )
        
        print(f"Generated recommendations for sadness:")
        for category, items in recommendations.items():
            print(f"  {category}: {len(items) if items else 0} items")
            if items and len(items) > 0:
                first_item = items[0]
                if isinstance(first_item, dict):
                    print(f"    Sample keys: {list(first_item.keys())}")
                    
    except Exception as e:
        print(f"❌ Error testing RecommendationEngine: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_emotion_classifier()
    test_data_structures()
    test_content_loader()
    test_recommendation_engine()
    print("\n🏁 Testing complete!")
