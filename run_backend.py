"""
Proper backend startup script that handles imports correctly
"""
import sys
import os
from pathlib import Path

# Add the repo root to Python path
repo_root = Path(__file__).parent
sys.path.insert(0, str(repo_root))

# Now import and run the backend
if __name__ == "__main__":
    import uvicorn
    
    # Import the app from the backend module
    from backend.app import app
    
    print("🚀 Starting HealWise backend...")
    print(f"📁 Repo root: {repo_root}")
    print(f"🐍 Python path includes: {repo_root}")
    
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_dirs=[str(repo_root / "backend")]
    )