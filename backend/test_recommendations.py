# Create backend/test_recommendations.py
import sys
from pathlib import Path

# Follow HealWise sys.path convention per copilot-instructions.md
backend_path = Path(__file__).parent.absolute()
repo_root = backend_path.parent
for path in [str(repo_root), str(backend_path)]:
    if path not in sys.path:
        sys.path.insert(0, path)

from services.content_loader import ContentLoader
from services.recommendation_engine import RecommendationEngine

def test_content_loading():
    """Test if JSON data is being loaded correctly"""
    print("🧪 Testing HealWise Content Loading")
    print("=" * 50)
    
    # Check if data files exist
    data_dir = backend_path / "data"
    print(f"Data directory: {data_dir}")
    print(f"Data directory exists: {data_dir.exists()}")
    
    if data_dir.exists():
        json_files = list(data_dir.glob("*.json"))
        print(f"JSON files found: {[f.name for f in json_files]}")
        
        # Test content loader
        try:
            content_loader = ContentLoader()
            print("\n📂 Content loaded:")
            print(f"  Quotes: {len(content_loader.quotes)} categories")
            print(f"  Movies: {len(content_loader.movies)} categories") 
            print(f"  Books: {len(content_loader.books)} categories")
            print(f"  Exercises: {len(content_loader.exercises)} categories")
            print(f"  Nutrition: {len(content_loader.nutrition)} categories")
            print(f"  Activities: {len(content_loader.activities)} categories")
            print(f"  Resources: {len(content_loader.resources)} categories")
            
            # Test specific content
            print(f"\n🔍 Sample content for 'safe' risk level:")
            safe_quotes = content_loader.get_content_by_risk('quotes', 'safe')
            print(f"  Safe quotes: {len(safe_quotes)} items")
            if safe_quotes:
                print(f"  First quote: {safe_quotes[0][:100]}...")
            
            # Test recommendation engine
            print(f"\n🎯 Testing recommendation engine:")
            engine = RecommendationEngine(content_loader)
            test_emotions = {"nervousness": 0.8, "fear": 0.3}
            recommendations = engine.get_personalized_recommendations("low", test_emotions)
            
            print(f"  Generated recommendations:")
            for category, items in recommendations.items():
                print(f"    {category}: {len(items)} items")
                
            return True
            
        except Exception as e:
            print(f"❌ Error loading content: {e}")
            import traceback
            traceback.print_exc()
            return False
    else:
        print("❌ Data directory not found")
        return False

if __name__ == "__main__":
    test_content_loading()