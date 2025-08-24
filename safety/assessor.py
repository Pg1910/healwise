"""
Crisis assessment for HealWise with therapeutic LLM integration
Per copilot-instructions.md: mixes heuristics with local LLM via Ollama
Enhanced for therapeutic response quality
"""

import subprocess
import json
from enum import Enum
from typing import Dict, Any, Tuple

class Risk(Enum):
    """Risk levels per copilot-instructions.md: SAFE/LOW/MODERATE/HIGH/CRISIS"""
    SAFE = "SAFE"
    LOW = "LOW" 
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRISIS = "CRISIS"

def assess_crisis_signals(text: str, probs: Dict[str, float]) -> Risk:
    """
    Assess crisis signals with enhanced therapeutic context
    Per copilot-instructions.md: uses mistral:latest for nuanced assessment
    """
    if not text or not text.strip():
        return Risk.SAFE
    
    text_lower = text.lower()
    
    # Immediate crisis keywords (override LLM for safety)
    crisis_keywords = [
        "kill myself", "end my life", "suicide plan", "want to die",
        "going to hurt myself", "end it all", "tonight", "right now"
    ]
    
    if any(keyword in text_lower for keyword in crisis_keywords):
        return Risk.CRISIS
    
    # Get LLM therapeutic assessment
    llm_risk, therapeutic_context = _therapeutic_llm_assessment(text, probs)
    
    # Get heuristic baseline
    heuristic_risk = _heuristic_assessment(text_lower, probs)
    
    # Take higher risk for safety, but preserve therapeutic context
    final_risk = _max_risk(heuristic_risk, llm_risk)
    
    # Store therapeutic context for response generation (if needed)
    if hasattr(assess_crisis_signals, '_last_therapeutic_context'):
        assess_crisis_signals._last_therapeutic_context = therapeutic_context
    
    return final_risk

def _therapeutic_llm_assessment(text: str, probs: Dict[str, float]) -> Tuple[Risk, str]:
    """
    Enhanced LLM assessment with therapeutic understanding
    Returns (risk_level, therapeutic_context)
    """
    try:
        # Enhanced prompt for therapeutic assessment
        top_emotions = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
        emotions_str = ", ".join([f"{emotion}: {prob:.2f}" for emotion, prob in top_emotions])
        
        prompt = f"""You are a mental health assessment AI. Analyze this text for both crisis risk and therapeutic needs.

Text: "{text}"
Key emotions detected: {emotions_str}

First, provide the crisis risk level (respond with exactly one word):
SAFE, LOW, MODERATE, HIGH, or CRISIS

Guidelines:
- SAFE: Positive content, mild everyday concerns
- LOW: Stress, worry, but coping mechanisms intact  
- MODERATE: Significant distress, hopelessness, isolation
- HIGH: Self-harm ideation, severe depression, substance abuse
- CRISIS: Immediate suicide risk, specific plans, imminent danger

Then on a new line, provide therapeutic context in 1-2 sentences describing the person's emotional state and primary needs.

Assessment:"""

        result = subprocess.run([
            "ollama", "run", "mistral:latest"
        ], 
        input=prompt, 
        text=True, 
        capture_output=True, 
        timeout=30
        )
        
        if result.returncode == 0:
            response_lines = result.stdout.strip().split('\n')
            
            # Extract risk level (first line)
            risk_line = response_lines[0].strip().upper()
            try:
                risk = Risk(risk_line)
            except ValueError:
                # Try to extract risk from response
                for risk_val in Risk:
                    if risk_val.value in risk_line:
                        risk = risk_val
                        break
                else:
                    risk = Risk.SAFE
            
            # Extract therapeutic context (remaining lines)
            therapeutic_context = " ".join(response_lines[1:]).strip() if len(response_lines) > 1 else ""
            
            return risk, therapeutic_context
        else:
            return Risk.SAFE, ""
            
    except Exception:
        # Fallback to SAFE per copilot-instructions.md
        return Risk.SAFE, ""

def _heuristic_assessment(text_lower: str, probs: Dict[str, float]) -> Risk:
    """Enhanced heuristic assessment with therapeutic patterns"""
    
    # Emotion analysis from SamLowe/roberta-base-go_emotions
    sadness = probs.get("sadness", 0)
    fear = probs.get("fear", 0) 
    anger = probs.get("anger", 0)
    nervousness = probs.get("nervousness", 0)  # anxiety
    disgust = probs.get("disgust", 0)
    
    # Positive emotions
    joy = probs.get("joy", 0)
    optimism = probs.get("optimism", 0)
    gratitude = probs.get("gratitude", 0)
    love = probs.get("love", 0)
    
    # Strong positive indicators → SAFE
    if joy > 0.6 or optimism > 0.5 or gratitude > 0.4 or love > 0.5:
        return Risk.SAFE
    
    # Crisis language patterns
    crisis_patterns = [
        "detailed plan", "stockpiling", "tonight", "right now",
        "can't go on", "end it all", "final decision"
    ]
    
    high_risk_patterns = [
        "hurt myself", "self harm", "better off without me",
        "burden to everyone", "want to disappear", "numb the pain"
    ]
    
    moderate_patterns = [
        "hopeless", "trapped", "overwhelming", "can't cope",
        "giving up", "pointless", "no future", "alone"
    ]
    
    if any(pattern in text_lower for pattern in crisis_patterns):
        return Risk.CRISIS
    elif any(pattern in text_lower for pattern in high_risk_patterns):
        return Risk.HIGH
    elif any(pattern in text_lower for pattern in moderate_patterns):
        return Risk.MODERATE
    
    # Emotion-based escalation
    distress_score = sadness + fear + anger + nervousness + disgust
    
    if distress_score > 2.8:
        return Risk.HIGH
    elif distress_score > 2.0:
        return Risk.MODERATE  
    elif distress_score > 1.2:
        return Risk.LOW
    
    return Risk.SAFE

def _max_risk(risk1: Risk, risk2: Risk) -> Risk:
    """Return higher risk level for safety"""
    risk_order = [Risk.SAFE, Risk.LOW, Risk.MODERATE, Risk.HIGH, Risk.CRISIS]
    return risk_order[max(risk_order.index(risk1), risk_order.index(risk2))]

def get_therapeutic_context() -> str:
    """Get the last therapeutic context from LLM assessment"""
    return getattr(assess_crisis_signals, '_last_therapeutic_context', "")
