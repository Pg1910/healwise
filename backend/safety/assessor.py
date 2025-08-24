"""
Crisis signal assessment per copilot instructions
Combines heuristics with LLM reasoning via Ollama
"""
import re
import subprocess
import asyncio
from typing import Dict

class Risk:
    SAFE = "SAFE"
    LOW = "LOW" 
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRISIS = "CRISIS"

def assess_crisis_signals(text: str, emotion_probs: Dict[str, float]) -> str:
    """
    Assess crisis signals from text and emotion probabilities.
    Uses heuristics + LLM reasoning via Ollama with timeout.
    Per copilot instructions: may call Ollama, expects fallback to SAFE
    """
    
    # Step 1: Quick heuristic check (fast)
    heuristic_risk = _heuristic_assessment(text, emotion_probs)
    
    # Step 2: If heuristic suggests concern, use LLM with timeout
    if heuristic_risk in [Risk.HIGH, Risk.CRISIS]:
        try:
            llm_risk = _llm_reasoning_with_timeout(text, emotion_probs, timeout=8.0)
            # Take the higher of the two assessments
            return _max_risk(heuristic_risk, llm_risk)
        except Exception as e:
            print(f"⚠️ LLM reasoning failed, using heuristic: {e}")
            return heuristic_risk
    
    return heuristic_risk

def _heuristic_assessment(text: str, emotion_probs: Dict[str, float]) -> str:
    """Fast heuristic-based risk assessment"""
    text_lower = text.lower()
    
    # Crisis indicators (immediate risk)
    crisis_keywords = [
        'kill myself', 'suicide', 'end it all', 'don\'t want to live',
        'hurt myself', 'die', 'overdose', 'jump off', 'hanging myself'
    ]
    
    # High risk indicators
    high_keywords = [
        'hopeless', 'worthless', 'burden', 'can\'t go on',
        'nothing matters', 'give up', 'no point', 'hate myself'
    ]
    
    # Check for crisis signals
    for keyword in crisis_keywords:
        if keyword in text_lower:
            return Risk.CRISIS
    
    # Check for high risk signals
    for keyword in high_keywords:
        if keyword in text_lower:
            return Risk.HIGH
    
    # Check emotion probabilities
    sadness = emotion_probs.get('sadness', 0)
    fear = emotion_probs.get('fear', 0)
    anger = emotion_probs.get('anger', 0)
    
    if sadness > 0.7 or fear > 0.6:
        return Risk.MODERATE
    elif sadness > 0.5 or anger > 0.6:
        return Risk.LOW
    
    return Risk.SAFE

def _llm_reasoning_with_timeout(text: str, emotion_probs: Dict[str, float], timeout: float = 8.0) -> str:
    """
    LLM reasoning with strict timeout and proper encoding handling.
    Per copilot instructions: expects Ollama with mistral model, fallback to SAFE
    """
    try:
        prompt = f"""Analyze for mental health crisis risk. Respond with only one word:

Text: "{text}"
Emotions: {emotion_probs}

Response options: SAFE, LOW, MODERATE, HIGH, CRISIS

Your response:"""

        # Run Ollama with timeout and proper encoding
        result = subprocess.run([
            'ollama', 'run', 'mistral', prompt
        ], capture_output=True, text=True, timeout=timeout, encoding='utf-8', errors='replace')
        
        if result.returncode == 0:
            response = result.stdout.strip().upper()
            valid_responses = ['SAFE', 'LOW', 'MODERATE', 'HIGH', 'CRISIS']
            if response in valid_responses:
                return response
                
    except subprocess.TimeoutExpired:
        print("⚠️ Ollama timeout - falling back to SAFE")
    except FileNotFoundError:
        print("⚠️ Ollama not found - falling back to SAFE")
    except UnicodeDecodeError as e:
        print(f"⚠️ Ollama encoding error: {e} - falling back to SAFE")
    except Exception as e:
        print(f"⚠️ LLM reasoning error: {e}")
    
    return Risk.SAFE  # Fallback per copilot instructions

def _max_risk(risk1: str, risk2: str) -> str:
    """Return the higher of two risk levels"""
    risk_order = [Risk.SAFE, Risk.LOW, Risk.MODERATE, Risk.HIGH, Risk.CRISIS]
    idx1 = risk_order.index(risk1) if risk1 in risk_order else 0
    idx2 = risk_order.index(risk2) if risk2 in risk_order else 0
    return risk_order[max(idx1, idx2)]