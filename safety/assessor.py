# backend/safety/assessor.py
import subprocess
from enum import Enum

class Risk(Enum):
    SAFE = "SAFE"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRISIS = "CRISIS"

def _llm_reasoning(text: str) -> Risk:
    """
    Use a local reasoning LLM (via Ollama) to classify intent.
    Models to install: mistral, phi3
    Example: ollama pull mistral
    """
    prompt = f"""
    You are a mental health safety checker.
    Classify the following text into EXACTLY one of these categories:
    SAFE, LOW, MODERATE, HIGH, CRISIS.
    Text: "{text}"
    Answer with ONLY the label.
    """
    result = subprocess.run(
        ["ollama", "run", "mistral"],   # or "phi3" if using phi-3-mini
        input=prompt.encode(),
        capture_output=True
    )
    label = result.stdout.decode().strip().upper()
    try:
        return Risk[label]
    except KeyError:
        return Risk.SAFE

def assess_crisis_signals(text: str, probs: dict) -> Risk:
    """
    Hybrid approach:
    - Quick check via emotion probs
    - Deep reasoning via LLM if risk-related cues are found
    """
    # Quick heuristics from classifier
    if probs.get("suicide_prob", 0) > 0.7:
        return Risk.HIGH
    if probs.get("anxiety_prob", 0) > 0.6 or probs.get("depression_prob", 0) > 0.6:
        return Risk.MODERATE

    # Escalate to reasoning LLM for deeper check
    return _llm_reasoning(text)
