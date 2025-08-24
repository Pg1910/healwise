#!/usr/bin/env python3
"""
Quick test to verify backend data has no links
"""
import json
import os
from pathlib import Path

def check_for_links(data, filename):
    """Check if any data contains URL links"""
    found_links = []
    
    def search_dict(obj, path=""):
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                if isinstance(value, str) and ("http://" in value or "https://" in value):
                    found_links.append(f"{current_path}: {value}")
                elif isinstance(value, (dict, list)):
                    search_dict(value, current_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                current_path = f"{path}[{i}]"
                search_dict(item, current_path)
    
    search_dict(data)
    return found_links

def main():
    data_dir = Path("backend/data")
    files_to_check = [
        "books.json",
        "movies.json", 
        "activities.json",
        "resources.json",
        "exercises.json",
        "nutrition.json",
        "quotes.json"
    ]
    
    print("🔍 Checking for remaining links in data files...")
    print("=" * 60)
    
    total_links = 0
    
    for filename in files_to_check:
        filepath = data_dir / filename
        if filepath.exists():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                links = check_for_links(data, filename)
                if links:
                    print(f"\n❌ {filename}: Found {len(links)} links")
                    for link in links:
                        print(f"   {link}")
                    total_links += len(links)
                else:
                    print(f"✅ {filename}: No links found")
                    
            except Exception as e:
                print(f"❌ {filename}: Error reading file - {e}")
        else:
            print(f"⚠️  {filename}: File not found")
    
    print("\n" + "=" * 60)
    if total_links == 0:
        print("🎉 SUCCESS: All links have been removed!")
    else:
        print(f"⚠️  Found {total_links} remaining links that need to be removed.")
    
    # Also check data structure for frontend compatibility
    print("\n📊 Checking data structure for frontend compatibility...")
    
    # Check books structure
    books_file = data_dir / "books.json"
    if books_file.exists():
        with open(books_file, 'r') as f:
            books = json.load(f)
        
        sample_book = books.get('moderate', [{}])[0] if books.get('moderate') else {}
        required_fields = ['title', 'author', 'description']
        missing_fields = [field for field in required_fields if field not in sample_book]
        
        if missing_fields:
            print(f"❌ Books missing fields: {missing_fields}")
        else:
            print("✅ Books structure is compatible")
    
    # Check movies structure  
    movies_file = data_dir / "movies.json"
    if movies_file.exists():
        with open(movies_file, 'r') as f:
            movies = json.load(f)
        
        sample_movie = movies.get('moderate', [{}])[0] if movies.get('moderate') else {}
        required_fields = ['title', 'genre', 'description']
        missing_fields = [field for field in required_fields if field not in sample_movie]
        
        if missing_fields:
            print(f"❌ Movies missing fields: {missing_fields}")
        else:
            print("✅ Movies structure is compatible")

if __name__ == "__main__":
    main()
