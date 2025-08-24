# backend/services/content_loader.py
import json
from pathlib import Path
from typing import Dict, List

class ContentLoader:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent / "data"
        self._load_all_content()
    
    def _load_all_content(self):
        self.quotes = self._load_json("quotes.json")
        self.movies = self._load_json("movies.json")
        self.books = self._load_json("books.json")
        self.exercises = self._load_json("exercises.json")
        self.nutrition = self._load_json("nutrition.json")
        self.activities = self._load_json("activities.json")
        self.resources = self._load_json("resources.json")
    
    def _load_json(self, filename: str) -> Dict:
        try:
            with open(self.data_dir / filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def get_content_by_risk(self, content_type: str, risk_level: str) -> List[Dict]:
        content_map = {
            'quotes': self.quotes,
            'movies': self.movies,
            'books': self.books,
            'exercises': self.exercises,
            'nutrition': self.nutrition,
            'activities': self.activities,
            'resources': self.resources
        }
        
        content = content_map.get(content_type, {})
        return content.get(risk_level.lower(), [])