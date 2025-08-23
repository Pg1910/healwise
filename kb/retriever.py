import re
from pathlib import Path
from typing import Dict

# Resolve the KB directory relative to this file to avoid CWD-dependent errors
KB_DIR = Path(__file__).resolve().parent

def _build_index() -> Dict[str, Path]:
    """Build an index of markdown files in the KB directory.

    This is resilient to missing folders and only indexes *.md files.
    """
    index: Dict[str, Path] = {}
    if not KB_DIR.exists() or not KB_DIR.is_dir():
        return index
    for p in KB_DIR.glob("*.md"):
        if p.is_file():
            index[p.stem] = p
    return index

# Build once at import time; can be refreshed via refresh_index() if needed
KB = _build_index()

def refresh_index() -> None:
    """Refresh the in-memory KB index (useful in tests)."""
    global KB
    KB = _build_index()

def retrieve(query: str, k: int = 2):
    """Retrieve relevant documents based on keyword overlap.

    If no KB files are present, returns an empty list instead of raising.
    """
    if not query:
        return []

    # Ensure index exists even if module imported before files were created
    if not KB:
        refresh_index()

    scores = []
    q = set(re.findall(r"\w+", query.lower()))
    for name, path in KB.items():
        try:
            text = path.read_text(encoding="utf-8").lower()
        except FileNotFoundError:
            # File may have been removed after index creation; skip it
            continue
        tset = set(re.findall(r"\w+", text))
        scores.append((len(q & tset), name))

    scores.sort(reverse=True)
    return [KB[n].read_text(encoding="utf-8") for _, n in scores[:k] if n in KB]

# Keep the old function name for backwards compatibility
def retrieve_documents(query: str, k: int = 2):
    """Alias for retrieve function"""
    return retrieve(query, k)
