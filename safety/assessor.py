from safety.ladder import Risk

def assess_crisis_signals(textt:str , clf_scores:dict) ->Risk:
    """clf_scores_examples: {suicide_prob :0.82 , depression prob 0.71, anxiety_prob : 0.43}"""
    s = clf_scores.get('suicide_prob',0.0)
    d = clf_scores.get('depression_prob',0.0)
    
    #thresholds you will caliberate later 
    if s >0.85 : return Risk.CRISIS
    if s >0.65 or (d >0.8 and "hopeless" in text.lower()):return Risk.HIGH
    if d >0.6: return RISK.ELEVATED
    return Risk.SAFE