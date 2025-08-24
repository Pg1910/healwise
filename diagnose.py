"""
Diagnostic script to check HealWise backend dependencies and setup
"""
import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if all required packages are installed"""
    required = ['fastapi', 'uvicorn', 'transformers', 'torch']
    missing = []
    
    for pkg in required:
        try:
            __import__(pkg)
            print(f"✅ {pkg} - installed")
        except ImportError:
            print(f"❌ {pkg} - MISSING")
            missing.append(pkg)
    
    return missing

def check_file_structure():
    """Check if required files exist"""
    repo_root = Path(__file__).parent
    required_files = [
        'backend/app.py',
        'backend/models/mental_classifier.py',
        'backend/safety/assessor.py',
        'backend/safety/ladder.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = repo_root / file_path
        if full_path.exists():
            print(f"✅ {file_path} - exists")
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    return missing_files

def check_ollama():
    """Check if Ollama is available"""
    try:
        import subprocess
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ollama - installed")
            if 'mistral' in result.stdout:
                print("✅ Mistral model - available")
            else:
                print("⚠️ Mistral model - not found (run: ollama pull mistral)")
        else:
            print("❌ Ollama - not working")
    except FileNotFoundError:
        print("❌ Ollama - not installed")

if __name__ == "__main__":
    print("🔍 HealWise Backend Diagnostic")
    print("=" * 40)
    
    print("\n📦 Checking Python dependencies:")
    missing_deps = check_dependencies()
    
    print("\n📁 Checking file structure:")
    missing_files = check_file_structure()
    
    print("\n🤖 Checking Ollama:")
    check_ollama()
    
    print("\n" + "=" * 40)
    if missing_deps or missing_files:
        print("❌ Issues found!")
        if missing_deps:
            print(f"Install missing packages: pip install {' '.join(missing_deps)}")
        if missing_files:
            print(f"Missing files: {missing_files}")
    else:
        print("✅ All checks passed!")