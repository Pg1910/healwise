# safety/bias.py
REPLACEMENTS = {
    r"\baddict\b": "person with a substance use disorder",
    r"\bschizo(phrenic)?\b": "person living with schizophrenia",
}

import re
def de_stigmatize(text: str) -> str:
    for pat, repl in REPLACEMENTS.items():
        text = re.sub(pat, repl, text, flags=re.IGNORECASE)
    return text
