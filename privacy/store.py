import json , os 
from cryptography.fernet import Fernet

class SecureStore:
    def __init__(self,key:bytes|None):
        self.fernet = Fernet(key) if key else None
    
    def save(self , path , data:dict):
        raw = json.dumps(data).encode("utf-8")
        blob = self.fernet.encrypt(raw) if self.fernet else raw
        with open (path , "wb") as f:f.write(blob)
        
    def load(self,path):
        blob = open(path , "rb").read()
        raw  = self.fernet.decrypt(blob) if self.fernet else blob
        return json.loads(raw)