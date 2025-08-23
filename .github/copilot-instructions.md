# HealWise – AI agent instructions

Purpose: Fast mental‑health text analysis with a FastAPI backend (emotions + risk) and a React/Vite chat UI.

## Architecture
- Backend (`backend/app.py`): FastAPI routes
  - POST `/analyze` → `{ probs, risk, supportive_message, suggested_next_steps, helpful_resources }`
  - GET `/health` → liveness
- Models (`backend/models/mental_classifier.py`): HuggingFace `SamLowe/roberta-base-go_emotions`; `score_probs(text, top_k=5)` returns top emotions with probs. Global load + `model.eval()` at import.
- Safety (`backend/safety`):
  - `assessor.py` → `assess_crisis_signals(text, probs)` mixes heuristics with local LLM via Ollama (`ollama run mistral`).
  - `ladder.py` → `ACTIONS` mapping from risk → suggested user actions.
  - `bias.py` → `de_stigmatize(text)` regex replacements.
- KB (`kb/retriever.py`): keyword‑overlap retriever; returns full `.md` contents from `kb/`.
- Frontend (`frontend/`): Vite + React chat (`src/app.jsx`) calling `/analyze`; helpers in `src/services/api.{js,ts}`.

## Data flow
1) Frontend sends `{text}` → `/analyze`.
2) Backend: emotions via `score_probs` → risk via `assess_crisis_signals` (may call Ollama) → empathy tag → `de_stigmatize` → `ACTIONS[risk]` → `kb.retrieve(k=2)`.
3) Frontend renders supportive message + risk + next steps + resources.

## Repo‑specific conventions & gotchas
- Imports: `app.py` mutates `sys.path` to import `safety`, `kb`, `utils` from repo root; keep layout stable or run backend from `backend/`.
- Risk enums differ: `assessor.Risk` (SAFE/LOW/MODERATE/HIGH/CRISIS) vs `ladder.Risk` (SAFE/ELEVATED/HIGH/CRISIS). `app.py` uses `assessor.Risk` but reads `ACTIONS` from ladder. If editing enums, add an explicit mapping.
- Known issues (don’t re‑introduce):
  - `app.py` updates `analyze.history` after `return` (dead code); history is effectively unused.
  - `backend/requirements.txt` is missing FastAPI/uvicorn; add `fastapi` and `uvicorn` when running the API.
  - `safety/use_limits.py` has typos; file is currently unused.
  - `kb/retriever.py` assumes `.md` files present; returns full file text.
  - Ollama must be installed with a pulled model (e.g., `mistral`) for `_llm_reasoning` to work; otherwise expect fallback to SAFE.
- CORS: allows `http://localhost:5173` (Vite default).

## Build/run/test
- Backend: install deps from `backend/requirements.txt` plus `fastapi` and `uvicorn`; run from `backend/` so imports resolve (e.g., `uvicorn backend.app:app --reload` if repo root on PYTHONPATH, or `uvicorn app:app --reload` from `backend/`).
- Frontend: `cd frontend && npm i && npm run dev` (port 5173).
- Test: `test_classifier.py` imports `models.mental_classifier`; run with `PYTHONPATH=backend` or from within `backend/`.

## Extension points
- New models under `backend/models/`; surface via new FastAPI endpoints in `app.py`.
- Tune safety by editing `assess_crisis_signals` or changing the Ollama model/command.
- Add `.md` files in `kb/` to change retrieval results.

## Contract example
- Request: `{ "text": "I'm overwhelmed" }`
- Response keys: `probs` (emotion→prob), `risk` (string), `supportive_message` (str), `suggested_next_steps` (list), `helpful_resources` (list of texts)
