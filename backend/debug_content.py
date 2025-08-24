#!/usr/bin/env python3
"""Test the content loader and recommendation engine directly"""

import sys
from pathlib import Path

# Add backend to path per HealWise conventions
backend_path = Path(__file__).parent.absolute()
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from services.content_loader import ContentLoader
from services.recommendation_engine import RecommendationEngine

def test_content_loading():
    print("🧪 Testing Content Loading with Different Risk Levels")
    print("=" * 60)
    
    cl = ContentLoader()
    re = RecommendationEngine(cl)
    
    # Test all risk levels
    risk_levels = ['safe', 'low', 'moderate', 'high', 'crisis']
    
    for risk in risk_levels:
        print(f"\n📊 Testing risk level: '{risk}'")
        
        # Test quotes
        quotes = cl.get_content_by_risk('quotes', risk)
        print(f"  Quotes: {len(quotes)} items")
        if quotes:
            print(f"    Sample: {quotes[0][:60]}...")
        
        # Test movies
        movies = cl.get_content_by_risk('movies', risk)
        print(f"  Movies: {len(movies)} items")
        if movies:
            print(f"    Sample: {movies[0].get('title', 'No title')}")
        
        # Test full recommendation
        test_emotions = {"anxiety": 0.7, "fear": 0.3}
        recommendations = re.get_personalized_recommendations(risk, test_emotions)
        
        total_items = sum(len(v) for v in recommendations.values())
        print(f"  Total recommendations generated: {total_items}")
        
        for category, items in recommendations.items():
            if items:
                print(f"    {category}: {len(items)} items")

if __name__ == "__main__":
    test_content_loading()
