import random

RESPONSES = {
    "suicide_high": [
        "I hear the pain in your words. You're not alone—it's okay to reach out for help.",
        "That sounds really heavy. I'm here with you, and I want you to know support exists.",
        "I can sense how overwhelming this feels. Sharing it takes courage—you’re not alone."
    ],
    "anxiety_high": [
        "It sounds like your mind is racing. Let's take a breath together—you’re safe here.",
        "I can sense the worry in your words. You're doing your best in a hard moment.",
        "Feeling anxious is really tough. Thank you for sharing it—you’re not facing it alone."
    ],
    "depression_high": [
        "I hear how low you're feeling. Even in this darkness, reaching out is a strong step.",
        "It sounds like things feel really heavy. You're not alone—I’m here with you.",
        "That sadness must be hard to carry. I want you to know your feelings are valid."
    ],
    "neutral": [
    "I’m glad to hear that. It's important to notice the good moments.",
    "That’s great—thanks for sharing something positive with me.",
    "I can sense you’re in a lighter mood. That’s wonderful!"
    ]

}

def empathize(tag: str, conversation_history: list[str] = None) -> str:
    """
    Return a varied empathetic response based on tag and optional history.
    """
    options = RESPONSES.get(tag, RESPONSES["neutral"])
    response = random.choice(options)

    # Optional: lightly adapt based on recent conversation
    if conversation_history and "alone" in conversation_history[-1].lower():
        response += " I want to reassure you—you’re not alone in this."

    return response
