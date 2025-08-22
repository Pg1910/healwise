import os , re ,json 
from pathlib import Path 

KB = {p.stem: Path("kb")/p for p in os.scandir("kb") if p.is_file() and p.name.endswith(".md")}

def retrieve (query :str ,k=2):
    scores = []
    q = set(re.findall(r"\w+",query.lower()))
    for name , path in KB.items():
        text = path.read_text(encoding = "utf-8").lower()
        tset = set(re.findall(r"\w+",text))
        scores.append((len(q & tset),name))
        
    scores.sort(reverse = True )
    return [KB[n].read_text(encoding = "utf-8") for _,n in scores [:k]]
