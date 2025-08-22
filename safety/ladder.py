from enum import Enum


class Risk(Enum):
    SAFE = 0; ELEVATED = 1;HIGH = 2;CRISIS = 3
    
ACTIONS  = {
    Risk.SAFE :["offer self-help tools","invite journaling prompt"],
    Risk.ELEVATED:["offer coping +suggest booking non-urgent therapy"],
    Risk.HIGH : ["suggest contacting a clinician with 24-48 hours","offer warm hand off"],
    Risk.CRISIS :["immediate safety planning ","display crisis contacts ","offer call now"]
}

