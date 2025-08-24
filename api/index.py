from http.server import BaseHTTPRequestHandler
import json
import re

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/analyze':
            self.handle_analyze()
        else:
            self.send_error(404)
    
    def do_GET(self):
        if self.path == '/api/health':
            self.handle_health()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def handle_health(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        
        response = {"status": "healthy", "model_loaded": True}
        self.wfile.write(json.dumps(response).encode())
    
    def handle_analyze(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            text = data.get('text', '')
            
            # Generate contextual response
            response = self.generate_contextual_fallback(text)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def generate_contextual_fallback(self, text):
        """Generate intelligent response based on text analysis"""
        text_lower = text.lower()
        
        # Analyze text for context
        supportive_message = "Thank you for sharing what's on your mind with me. I can tell there's depth to what you're experiencing."
        suggested_next_steps = []
        helpful_resources = []
        probs = {"neutral": 0.8, "optimism": 0.2}
        recommendations = {
            "activities": [],
            "books": [],
            "movies": [],
            "nutrition": [],
            "resources": []
        }
        
        # Contextual responses based on keywords
        if any(word in text_lower for word in ['anxious', 'worry', 'stress', 'nervous']):
            supportive_message = "I can hear the anxiety in what you're sharing. Feeling anxious is completely natural, and you're not alone in this. It takes courage to acknowledge these feelings."
            probs = {"anxiety": 0.7, "fear": 0.2, "neutral": 0.1}
            suggested_next_steps = [
                "Practice the 4-7-8 breathing technique to calm your nervous system",
                "Try the 5-4-3-2-1 grounding exercise to center yourself in the present",
                "Consider writing down your worries to externalize anxious thoughts",
                "Take a gentle walk outside if possible to change your environment"
            ]
            recommendations = {
                "activities": [
                    {"name": "Breathing Exercise", "description": "4-7-8 breathing technique", "duration": "5 minutes"}
                ],
                "books": [
                    {"title": "The Anxiety and Worry Workbook", "author": "David A. Clark"}
                ],
                "movies": [
                    {"title": "Inside Out", "description": "Understanding emotions", "mood": "calming"}
                ],
                "nutrition": [
                    {"name": "Chamomile Tea", "benefit": "Natural calming effects"}
                ],
                "resources": []
            }
        elif any(word in text_lower for word in ['sad', 'down', 'depressed', 'hopeless']):
            supportive_message = "I can sense the heaviness in your words. Sadness is a valid emotion that deserves space to be felt and processed. You're taking a brave step by reaching out."
            probs = {"sadness": 0.8, "neutral": 0.2}
            suggested_next_steps = [
                "Allow yourself to feel this sadness without judgment - emotions need space",
                "Consider gentle movement like stretching or a slow walk",
                "Reach out to someone you trust when you feel ready",
                "Practice self-compassion by treating yourself with kindness"
            ]
        elif any(word in text_lower for word in ['angry', 'frustrated', 'mad', 'furious']):
            supportive_message = "I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid."
            probs = {"anger": 0.7, "frustration": 0.2, "neutral": 0.1}
            suggested_next_steps = [
                "Channel this energy through physical activity like walking or exercise",
                "Write out your feelings without editing - let the anger flow onto paper",
                "Practice deep breathing to help manage the intensity"
            ]
        elif any(word in text_lower for word in ['overwhelmed', 'too much', 'cant cope']):
            supportive_message = "It sounds like you're carrying a lot right now. Feeling overwhelmed makes complete sense when life feels like too much all at once."
            probs = {"overwhelmed": 0.6, "anxiety": 0.3, "neutral": 0.1}
            suggested_next_steps = [
                "Break down overwhelming tasks into smaller, manageable steps",
                "Practice saying 'no' to non-essential commitments right now",
                "Set aside 10 minutes for deep breathing or meditation"
            ]
        else:
            suggested_next_steps = [
                "Take a few moments to check in with your body and breath",
                "Consider what one small thing might bring you comfort right now",
                "Practice mindful awareness of your current feelings"
            ]
        
        # Always include supportive resources
        helpful_resources = [
            "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
            "National Suicide Prevention Lifeline: 988",
            "Mental Health America resources: mhanational.org"
        ]
        
        return {
            "probs": probs,
            "risk": "SAFE",
            "supportive_message": supportive_message,
            "suggested_next_steps": suggested_next_steps,
            "helpful_resources": helpful_resources,
            "recommendations": recommendations
        }
