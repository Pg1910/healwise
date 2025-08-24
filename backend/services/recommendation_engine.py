# backend/services/recommendation_engine.py
"""
Enhanced recommendation engine for HealWise following copilot-instructions.md
Generates personalized therapeutic recommendations based on risk level and emotions
"""
from typing import Dict, List, Any, Optional
from .content_loader import ContentLoader
import random

class RecommendationEngine:
    def __init__(self, content_loader: ContentLoader):
        self.content_loader = content_loader
        print("✅ RecommendationEngine initialized")
    
    def get_personalized_recommendations(self, risk_level: str, emotions: Dict[str, float], user_preferences: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate personalized recommendations based on risk level and emotions
        Per copilot-instructions.md: diverse therapeutic content selection
        """
        print(f"Generating recommendations for risk={risk_level}, emotions={list(emotions.keys())[:3]}")
        
        recommendations = {
            "quotes": self._get_quotes(risk_level, emotions),
            "movies": self._get_movies(risk_level, emotions),
            "books": self._get_books(risk_level, emotions),
            "exercises": self._get_exercises(risk_level, emotions),
            "nutrition": self._get_nutrition(risk_level, emotions),
            "activities": self._get_activities(risk_level, emotions),
            "resources": self._get_resources(risk_level, emotions)
        }
        
        total_items = sum(len(v) for v in recommendations.values())
        print(f"Generated {total_items} total recommendation items")
        
        return recommendations
    
    def _get_quotes(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get inspirational quotes based on risk level"""
        quotes = self.content_loader.get_content_by_risk('quotes', risk_level)
        
        # Return up to 3 random quotes
        if quotes:
            return random.sample(quotes, min(3, len(quotes)))
        return []
    
    def _get_movies(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get movie recommendations based on risk level and emotions"""
        movies = self.content_loader.get_content_by_risk('movies', risk_level)
        
        # Return up to 3 movies
        if movies:
            return random.sample(movies, min(3, len(movies)))
        return []
    
    def _get_books(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get book recommendations"""
        books = self.content_loader.get_content_by_risk('books', risk_level)
        
        if books:
            return random.sample(books, min(3, len(books)))
        return []
    
    def _get_exercises(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get exercise recommendations based on risk level"""
        exercises = self.content_loader.get_content_by_risk('exercises', risk_level)
        
        if exercises:
            return random.sample(exercises, min(3, len(exercises)))
        return []
    
    def _get_nutrition(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get nutrition recommendations"""
        nutrition = self.content_loader.get_content_by_risk('nutrition', risk_level)
        
        if nutrition:
            return random.sample(nutrition, min(3, len(nutrition)))
        return []
    
    def _get_activities(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get activity/trip recommendations"""
        activities = self.content_loader.get_content_by_risk('activities', risk_level)
        
        if activities:
            return random.sample(activities, min(3, len(activities)))
        return []
    
    def _get_resources(self, risk_level: str, emotions: Dict[str, float]) -> List[Dict]:
        """Get professional resource links"""
        resources = self.content_loader.get_content_by_risk('resources', risk_level)
        
        # For resources, return up to 2 items
        if resources:
            return random.sample(resources, min(2, len(resources)))
        return []