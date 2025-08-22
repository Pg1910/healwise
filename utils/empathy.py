from textwrap import dedent 

NURSE_TEMPLATES = {
    "depression_high": dedent("""\
        I hear how heavy this feels. It makes sense you’re exhausted by it.
        You’re not alone in feeling this way, and it’s valid to say it’s hard.
        Here’s a small next step that’s helped others: {micro_step}.
        If you’re open, I can also guide a grounding exercise or connect you to support."""),
    "anxiety_high": dedent("""\
        Your body sounds stuck in alert mode—totally understandable given what you’re facing.
        You did the right thing by talking about it. One quick tool: {micro_step}.
        If anxiety spikes past what feels safe, I can help you reach real-time support."""),
    "suicide_high": dedent("""\
        Thank you for telling me. Your safety matters.
        I want to help you stay safe right now. We can walk through a brief safety plan together,
        and I can connect you with urgent support in your area.""")
    
}
MICRO_STEPS = {
    "breathing": "try a 4-6 breathing cycle (inhale 4, exhale 6) for 2 minutes",
    "grounding": "name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
    "reach_out": "message someone you trust one concrete sentence about how you feel"
}
def empathize(tag: str) -> str:
    micro = MICRO_STEPS["grounding" if "anxiety" in tag else "breathing"]
    base = NURSE_TEMPLATES.get(tag, NURSE_TEMPLATES["depression_high"])
    return base.format(micro_step=micro)