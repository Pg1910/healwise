import requests

OLLAMA_HOST = "http://127.0.0.1:11434"

def query_gemma(propmt:str,model:str = "gemma3:1b") -> str:
    """ send a prompt to gemma3 via ollama and return the response text"""
    
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(url,json = payload , timeout = 60)
        response.raise_for_status()
        data = response.json()
        return data.get("response","").strip()
    except Exception as e:
        return f"[Error querying Gemma:{str(e)}]"
    