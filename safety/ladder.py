from enum import Enum


# Keep this Risk for internal mapping but app.py uses safety.assessor.Risk
class Risk(Enum):
    SAFE = 0
    ELEVATED = 1
    HIGH = 2
    CRISIS = 3

# ACTIONS keyed by assessor.Risk string values for compatibility with app.py
ACTIONS = {
    "SAFE": [
        "Offer self-help tools",
        "Invite a journaling prompt",
        "Keep going and celebrate small wins",
    ],
    "LOW": [
        "Suggest coping strategies",
        "Encourage reaching out to a friend",
    ],
    "MODERATE": [
        "Recommend scheduling a therapy session",
        "Practice grounding techniques",
    ],
    "HIGH": [
        "Contact a clinician within 24–48 hours",
        "Seek immediate help if feeling unsafe",
    ],
    "CRISIS": [
        "Immediate safety planning",
        "Display crisis contacts (988)",
        "Offer to call now",
    ],
}

