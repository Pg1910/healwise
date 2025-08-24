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
        
        # Quotes are stored as simple strings, not objects
        if quotes:
            # quotes should already be a list of strings
            return random.sample(quotes, min(3, len(quotes)))
        return []
    
    def _get_movies(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get movie recommendations based on risk level and emotions"""
        movies = self.content_loader.get_content_by_risk('movies', risk_level)
        
        # Return up to 3 movies as simple strings
        if movies:
            selected = random.sample(movies, min(3, len(movies)))
            return [f"{movie['title']} - {movie['description']}" for movie in selected]
        return []
    
    def _get_books(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get book recommendations"""
        books = self.content_loader.get_content_by_risk('books', risk_level)
        
        if books:
            selected = random.sample(books, min(3, len(books)))
            return [f"{book['title']} by {book['author']} - {book['description']}" for book in selected]
        return []
    
    def _get_exercises(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get exercise recommendations based on risk level"""
        exercises = self.content_loader.get_content_by_risk('exercises', risk_level)
        
        if exercises:
            selected = random.sample(exercises, min(3, len(exercises)))
            return [f"{exercise['exercise']} ({exercise['duration']}) - {exercise['benefit']}" for exercise in selected]
        return []
    
    def _get_nutrition(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get nutrition recommendations"""
        nutrition = self.content_loader.get_content_by_risk('nutrition', risk_level)
        
        if nutrition:
            selected = random.sample(nutrition, min(3, len(nutrition)))
            return [f"{nutrition_item['food']} - {nutrition_item['benefit']}" for nutrition_item in selected]
        return []
    
    def _get_activities(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get activity/trip recommendations"""
        activities = self.content_loader.get_content_by_risk('activities', risk_level)
        
        if activities:
            selected = random.sample(activities, min(3, len(activities)))
            return [f"{activity['type']}: {activity['suggestion']}" for activity in selected]
        return []
    
    def _get_resources(self, risk_level: str, emotions: Dict[str, float]) -> List[str]:
        """Get support resources"""
        resources = self.content_loader.get_content_by_risk('resources', risk_level)
        
        if resources:
            selected = random.sample(resources, min(3, len(resources)))
            return [f"{resource['title']} - {resource['description']}" for resource in selected]
        return []