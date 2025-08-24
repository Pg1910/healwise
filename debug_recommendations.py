#!/usr/bin/env python3
"""
Simple test to debug recommendation engine without running server
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_path))

def test_recommendation_system():
    """Test the recommendation system components"""
    print("🧪 Testing HealWise Recommendation System")
    print("=" * 60)
    
    try:
        # Test ContentLoader
        print("\n1️⃣ Testing ContentLoader...")
        from services.content_loader import ContentLoader
        
        loader = ContentLoader()
        print("✅ ContentLoader initialized")
        
        # Test data loading for each type
        content_types = ['quotes', 'movies', 'books', 'exercises', 'nutrition', 'activities', 'resources']
        risk_levels = ['safe', 'low', 'moderate', 'high', 'crisis']
        
        print("\n📊 Data availability by risk level:")
        for content_type in content_types:
            print(f"\n{content_type}:")
            for risk_level in risk_levels:
                try:
                    data = loader.get_content_by_risk(content_type, risk_level)
                    count = len(data) if data else 0
                    print(f"  {risk_level}: {count} items")
                    if count > 0:
                        first_item = data[0]
                        if isinstance(first_item, dict):
                            keys = list(first_item.keys())[:3]  # Show first 3 keys
                            print(f"    Sample structure: {keys}")
                        else:
                            print(f"    Sample: {str(first_item)[:50]}...")
                except Exception as e:
                    print(f"  {risk_level}: ERROR - {e}")
        
        # Test RecommendationEngine
        print(f"\n\n2️⃣ Testing RecommendationEngine...")
        from services.recommendation_engine import RecommendationEngine
        
        engine = RecommendationEngine(loader)
        print("✅ RecommendationEngine initialized")
        
        # Test recommendations for different scenarios
        test_scenarios = [
            {
                "name": "Sad user (moderate risk)",
                "emotions": {"sadness": 0.7, "disappointment": 0.3},
                "risk_level": "moderate"
            },
            {
                "name": "Anxious user (high risk)",
                "emotions": {"nervousness": 0.8, "fear": 0.2},
                "risk_level": "high"
            },
            {
                "name": "Happy user (safe)",
                "emotions": {"joy": 0.9, "optimism": 0.1},
                "risk_level": "safe"
            }
        ]
        
        print(f"\n🎯 Testing recommendation generation:")
        for scenario in test_scenarios:
            print(f"\n--- {scenario['name']} ---")
            try:
                recommendations = engine.get_personalized_recommendations(
                    risk_level=scenario['risk_level'],
                    emotions=scenario['emotions']
                )
                
                print(f"Generated {sum(len(v) for v in recommendations.values())} total items:")
                for category, items in recommendations.items():
                    count = len(items) if items else 0
                    print(f"  {category}: {count} items")
                    if count > 0 and isinstance(items[0], dict):
                        sample_keys = list(items[0].keys())
                        print(f"    Structure: {sample_keys}")
                        
            except Exception as e:
                print(f"❌ Error: {e}")
                import traceback
                traceback.print_exc()
        
        # Test emotion classifier
        print(f"\n\n3️⃣ Testing Mental Classifier...")
        from models.mental_classifier import score_probs
        
        test_texts = [
            "I feel sad and lonely",
            "I'm really anxious about tomorrow",
            "I'm feeling great today!"
        ]
        
        for text in test_texts:
            emotions = score_probs(text, 3)
            print(f"'{text}' → {emotions}")
        
        print(f"\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_recommendation_system()
