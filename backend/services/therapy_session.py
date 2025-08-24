"""
Therapy Session Manager for HealWise
Handles conversation context, personalization, and therapy flow
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re

class TherapySession:
    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.start_time = datetime.now()
        self.conversation_history = []
        self.user_profile = {
            "emotions_mentioned": set(),
            "triggers_identified": [],
            "coping_strategies": [],
            "progress_indicators": [],
            "personal_details": {},
            "response_patterns": []
        }
        self.session_stage = "initial"  # initial, exploration, deep_dive, closure
        self.conversation_count = 0
        
    def analyze_conversation_stage(self, text: str, conversation_history: List) -> str:
        """Determine the current stage of therapy conversation"""
        self.conversation_count = len(conversation_history)
        
        if self.conversation_count <= 2:
            return "initial"
        elif self.conversation_count <= 6:
            return "exploration"
        elif self.conversation_count <= 15:
            return "deep_dive"
        else:
            return "closure"
    
    def extract_user_insights(self, text: str, emotions: dict) -> dict:
        """Extract and store insights about the user from their message"""
        insights = {}
        
        # Extract emotional patterns
        for emotion, prob in emotions.items():
            if prob > 0.3:
                self.user_profile["emotions_mentioned"].add(emotion)
        
        # Identify triggers (simple pattern matching)
        trigger_patterns = [
            r"when (.+?) (makes me|triggers|causes)",
            r"I get (.+?) because of (.+)",
            r"(.+?) always makes me feel"
        ]
        
        for pattern in trigger_patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                if isinstance(match, tuple):
                    self.user_profile["triggers_identified"].extend(match)
                else:
                    self.user_profile["triggers_identified"].append(match)
        
        # Extract personal details
        personal_patterns = {
            "work_stress": r"(work|job|office|boss|colleague)",
            "relationship": r"(partner|boyfriend|girlfriend|husband|wife|relationship)",
            "family": r"(family|parents|mom|dad|sister|brother)",
            "health": r"(health|sick|pain|doctor|medication)",
            "financial": r"(money|financial|bills|debt|income)"
        }
        
        for category, pattern in personal_patterns.items():
            if re.search(pattern, text.lower()):
                self.user_profile["personal_details"][category] = True
        
        insights["updated_profile"] = self.user_profile
        insights["conversation_themes"] = self._identify_themes()
        
        return insights
    
    def _identify_themes(self) -> List[str]:
        """Identify recurring themes in the conversation"""
        themes = []
        
        # Based on triggers and emotions
        if len(self.user_profile["triggers_identified"]) > 2:
            themes.append("trigger_management")
        
        if "anxiety" in self.user_profile["emotions_mentioned"]:
            themes.append("anxiety_support")
        
        if "sadness" in self.user_profile["emotions_mentioned"]:
            themes.append("mood_improvement")
        
        if self.user_profile["personal_details"].get("work_stress"):
            themes.append("work_life_balance")
        
        return themes
    
    def generate_personalized_response(self, text: str, emotions: dict, risk: str, 
                                     conversation_history: List) -> Tuple[str, bool, List[str]]:
        """Generate a personalized therapeutic response based on session context"""
        
        # Update session insights
        insights = self.extract_user_insights(text, emotions)
        stage = self.analyze_conversation_stage(text, conversation_history)
        
        # Generate response based on stage and context
        if stage == "initial":
            response = self._initial_stage_response(text, emotions)
            suggestion_mode = False
            suggestion_types = []
            
        elif stage == "exploration":
            response = self._exploration_stage_response(text, emotions, insights)
            suggestion_mode = False
            suggestion_types = []
            
        elif stage == "deep_dive":
            response = self._deep_dive_response(text, emotions, insights)
            # Offer suggestions after significant exploration
            suggestion_mode = self.conversation_count % 4 == 0  # Every 4th message
            suggestion_types = self._get_relevant_suggestion_types(insights)
            
        else:  # closure
            response = self._closure_stage_response(text, emotions, insights)
            suggestion_mode = True
            suggestion_types = ["summary", "resources", "next_steps"]
        
        return response, suggestion_mode, suggestion_types
    
    def _initial_stage_response(self, text: str, emotions: dict) -> str:
        """Generate response for initial conversation stage"""
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
        
        responses = {
            "anxiety": [
                "Thank you for sharing that with me. I can sense you're feeling anxious right now. That takes courage to express.",
                "I hear that you're experiencing anxiety. You're in a safe space here, and we can work through this together.",
                "Anxiety can feel overwhelming, and I want you to know that what you're feeling is valid. Let's explore this further."
            ],
            "sadness": [
                "I can feel the weight of what you're carrying. Thank you for trusting me with your feelings.",
                "Sadness is a natural human emotion, and it's okay to feel this way. I'm here to listen and support you.",
                "Your sadness is being heard and acknowledged. Sometimes expressing these feelings is the first step toward healing."
            ],
            "anger": [
                "I can sense your frustration and anger. These are powerful emotions that deserve to be understood.",
                "Anger often signals that something important to you has been affected. Let's explore what's behind these feelings.",
                "Your anger is valid, and I want to help you understand and work through what you're experiencing."
            ]
        }
        
        import random
        return random.choice(responses.get(dominant_emotion, [
            "Thank you for sharing with me. I'm here to listen and support you through whatever you're experiencing.",
            "I can sense you're going through something difficult. This is a safe space to explore your feelings.",
            "Your willingness to open up shows strength. Let's work together to understand what you're feeling."
        ]))
    
    def _exploration_stage_response(self, text: str, emotions: dict, insights: dict) -> str:
        """Generate response for exploration stage"""
        themes = insights.get("conversation_themes", [])
        
        if "trigger_management" in themes:
            return "I'm noticing some patterns in what triggers these feelings for you. Can you tell me more about what happens in your body and mind when you encounter these situations?"
        
        elif "work_life_balance" in themes:
            return "Work stress seems to be a significant factor in what you're experiencing. How do you usually cope when work becomes overwhelming? What would an ideal work day look like for you?"
        
        else:
            return "I'm beginning to understand your experience better. What would you say is the most challenging part of what you're going through right now?"
    
    def _deep_dive_response(self, text: str, emotions: dict, insights: dict) -> str:
        """Generate response for deep exploration stage"""
        coping_strategies = [
            "It sounds like you've been carrying this for a while. What strategies have you tried before, and which ones felt most helpful?",
            "I'm hearing some real insight in what you're sharing. How do you think your past experiences might be influencing how you're feeling now?",
            "You're showing a lot of self-awareness. What would you tell a close friend who was going through something similar?",
            "I notice you've mentioned several different aspects of this situation. Which one feels most urgent or important to address first?"
        ]
        
        import random
        return random.choice(coping_strategies)
    
    def _closure_stage_response(self, text: str, emotions: dict, insights: dict) -> str:
        """Generate response for closure stage"""
        return f"We've covered a lot of ground together in this conversation. I can see you've made some real progress in understanding yourself better. Before we wrap up, would you like me to provide some specific resources or suggestions to support you moving forward?"
    
    def _get_relevant_suggestion_types(self, insights: dict) -> List[str]:
        """Determine which suggestion types are most relevant for the user"""
        themes = insights.get("conversation_themes", [])
        suggestion_types = []
        
        if "anxiety_support" in themes:
            suggestion_types.extend(["mindful_movement", "peaceful_places"])
        
        if "mood_improvement" in themes:
            suggestion_types.extend(["feel_good_films", "healing_reads"])
        
        if "work_life_balance" in themes:
            suggestion_types.extend(["nourishing_care", "peaceful_places"])
        
        # Always include these as options
        suggestion_types.extend(["gentle_steps", "words_of_comfort"])
        
        return list(set(suggestion_types))  # Remove duplicates
    
    def should_avoid_redundant_response(self, new_response: str, conversation_history: List) -> bool:
        """Check if the response is too similar to recent responses"""
        if len(conversation_history) < 2:
            return False
        
        recent_responses = [msg.get("text", "") for msg in conversation_history[-3:] 
                          if msg.get("type") == "bot"]
        
        # Simple similarity check (can be enhanced with NLP)
        for recent in recent_responses:
            if self._calculate_similarity(new_response, recent) > 0.7:
                return True
        
        return False
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple similarity between two texts"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)


# Global session manager
class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, TherapySession] = {}
        self.cleanup_interval = timedelta(hours=24)  # Clean up sessions after 24 hours
    
    def get_or_create_session(self, session_id: Optional[str] = None) -> TherapySession:
        """Get existing session or create new one"""
        if session_id and session_id in self.sessions:
            return self.sessions[session_id]
        
        session = TherapySession(session_id)
        self.sessions[session.session_id] = session
        return session
    
    def cleanup_old_sessions(self):
        """Remove sessions older than cleanup_interval"""
        current_time = datetime.now()
        expired_sessions = [
            sid for sid, session in self.sessions.items()
            if current_time - session.start_time > self.cleanup_interval
        ]
        
        for sid in expired_sessions:
            del self.sessions[sid]

# Global instance
session_manager = SessionManager()
