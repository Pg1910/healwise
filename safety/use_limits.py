import time 
MAX_MINTUES = 30 

class SessionTimer:
    def __inits__(self): self.start = time.time()
    def minutes(self): return (time.time()-self.start)/60
    def over_limit(self): return self.minutes()>MAX_MINUTES
    