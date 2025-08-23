/**
 * HealWise Early Detection System - 100% Local & Private
 * Analyzes conversation patterns to predict mental health trends
 */

class EarlyDetectionEngine {
  constructor() {
    this.patterns = this.loadPatterns();
    this.userBaseline = this.loadUserBaseline();
  }

  // Load existing patterns from localStorage
  loadPatterns() {
    const saved = localStorage.getItem('healwise_patterns');
    return saved ? JSON.parse(saved) : {
      temporalTrends: [],
      linguisticMarkers: {},
      behavioralPatterns: {},
      interventionEffectiveness: {}
    };
  }

  loadUserBaseline() {
    const saved = localStorage.getItem('healwise_baseline');
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * TEMPORAL PATTERN ANALYSIS
   * Detects declining mental health trends over time
   */
  analyzeTemporalPatterns(conversations, timeWindow = 7) {
    const analysis = {
      moodTrend: this.calculateMoodTrend(conversations, timeWindow),
      responsePatterns: this.analyzeResponsePatterns(conversations, timeWindow),
      timingPatterns: this.analyzeTimingPatterns(conversations, timeWindow),
      earlyWarnings: []
    };

    // Detect concerning trends
    if (analysis.moodTrend.slope < -0.3) {
      analysis.earlyWarnings.push({
        type: 'DECLINING_MOOD',
        severity: 'MODERATE',
        message: 'Your emotional tone has been gradually shifting over the past week.',
        suggestions: ['Consider scheduling time for activities you enjoy', 'Practice mindfulness meditation']
      });
    }

    if (analysis.timingPatterns.lateNightIncrease > 0.5) {
      analysis.earlyWarnings.push({
        type: 'SLEEP_DISRUPTION',
        severity: 'LOW',
        message: 'I notice you\'ve been having conversations later at night recently.',
        suggestions: ['Try a sleep routine meditation', 'Consider reducing screen time before bed']
      });
    }

    return analysis;
  }

  calculateMoodTrend(conversations, days) {
    const recent = this.getRecentConversations(conversations, days);
    const moodScores = recent.map(conv => this.calculateMoodScore(conv));
    
    if (moodScores.length < 3) return { slope: 0, confidence: 0, scores: [] };

    // Simple linear regression
    const n = moodScores.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = moodScores.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * moodScores[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const confidence = Math.min(1, n / 7); // Higher confidence with more data

    return { slope, confidence, scores: moodScores };
  }

  calculateMoodScore(conversation) {
    if (!conversation.messages || conversation.messages.length === 0) return 0.5;
    
    const userMessages = conversation.messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) return 0.5;

    let totalScore = 0;
    let count = 0;

    userMessages.forEach(msg => {
      const analysis = msg.analysis || {};
      const probs = analysis.probs || {};
      
      // Positive emotions
      const positiveScore = (probs.joy || 0) + (probs.optimism || 0) + (probs.gratitude || 0) + (probs.love || 0);
      // Negative emotions  
      const negativeScore = (probs.sadness || 0) + (probs.fear || 0) + (probs.anger || 0) + (probs.anxiety || 0);

      let messageScore = 0.5 + (positiveScore * 0.3) - (negativeScore * 0.3);
      messageScore = Math.max(0, Math.min(1, messageScore));

      totalScore += messageScore;
      count++;
    });

    return count > 0 ? totalScore / count : 0.5;
  }

  analyzeResponsePatterns(conversations, timeWindow) {
    const recent = this.getRecentConversations(conversations, timeWindow);
    const lengths = recent.flatMap(conv => 
      conv.messages.filter(m => m.sender === 'user').map(m => m.text.length)
    );

    const avgLength = lengths.length > 0 ? lengths.reduce((sum, len) => sum + len, 0) / lengths.length : 0;
    
    return {
      averageLength: avgLength,
      messageCount: lengths.length,
      variation: this.calculateVariation(lengths)
    };
  }

  analyzeTimingPatterns(conversations, timeWindow) {
    const recent = this.getRecentConversations(conversations, timeWindow);
    const times = recent.map(conv => new Date(conv.timestamp || conv.createdAt || Date.now()));
    
    const lateNightMessages = times.filter(time => {
      const hour = time.getHours();
      return hour >= 22 || hour <= 5;
    }).length;

    return {
      lateNightIncrease: times.length > 0 ? lateNightMessages / times.length : 0,
      totalMessages: times.length
    };
  }

  /**
   * LINGUISTIC BIOMARKER DETECTION
   */
  analyzeLinguisticBiomarkers(text) {
    if (!text || text.length === 0) {
      return {
        markers: {},
        riskScore: 0,
        insights: []
      };
    }

    const markers = {
      absolutistLanguage: this.detectAbsolutistLanguage(text),
      selfReferentialLanguage: this.analyzeSelfReference(text),
      futureTenseReduction: this.analyzeFutureTense(text),
      cognitiveDistortions: this.detectCognitiveDistortions(text)
    };

    const riskScore = this.calculateLinguisticRisk(markers);
    
    return {
      markers,
      riskScore,
      insights: this.generateLinguisticInsights(markers)
    };
  }

  detectAbsolutistLanguage(text) {
    const absolutistWords = [
      'always', 'never', 'completely', 'totally', 'entirely', 'absolutely',
      'nothing', 'everything', 'all', 'none', 'every', 'constant'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const absolutistCount = words.filter(word => 
      absolutistWords.includes(word.replace(/[^\w]/g, ''))
    ).length;

    return {
      count: absolutistCount,
      ratio: words.length > 0 ? absolutistCount / words.length : 0,
      words: words.filter(word => absolutistWords.includes(word.replace(/[^\w]/g, '')))
    };
  }

  analyzeSelfReference(text) {
    const selfWords = ['i', 'me', 'my', 'myself', 'mine'];
    const words = text.toLowerCase().split(/\s+/);
    const selfCount = words.filter(word => selfWords.includes(word)).length;

    return {
      count: selfCount,
      ratio: words.length > 0 ? selfCount / words.length : 0,
      excessive: words.length > 0 ? selfCount / words.length > 0.15 : false
    };
  }

  analyzeFutureTense(text) {
    const futureWords = [
      'will', 'going', 'plan', 'hope', 'expect', 'tomorrow', 
      'next', 'future', 'later', 'soon', 'eventually'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const futureCount = words.filter(word => 
      futureWords.some(fw => word.includes(fw))
    ).length;

    return {
      count: futureCount,
      ratio: words.length > 0 ? futureCount / words.length : 0,
      reduced: words.length > 0 ? futureCount / words.length < 0.05 : false
    };
  }

  detectCognitiveDistortions(text) {
    const distortionPatterns = {
      allOrNothing: /\b(always|never|completely|totally)\b/gi,
      overgeneralization: /\b(everyone|nobody|everything|nothing)\b/gi,
      catastrophizing: /\b(terrible|awful|horrible|disaster|catastrophe)\b/gi,
      shouldStatements: /\b(should|must|have to|ought to)\b/gi
    };

    const distortions = {};
    Object.keys(distortionPatterns).forEach(pattern => {
      const matches = text.match(distortionPatterns[pattern]) || [];
      distortions[pattern] = {
        count: matches.length,
        matches: matches
      };
    });

    return distortions;
  }

  calculateLinguisticRisk(markers) {
    let risk = 0;
    
    if (markers.absolutistLanguage && markers.absolutistLanguage.ratio > 0.1) risk += 0.3;
    if (markers.selfReferentialLanguage && markers.selfReferentialLanguage.excessive) risk += 0.2;
    if (markers.futureTenseReduction && markers.futureTenseReduction.reduced) risk += 0.2;
    
    if (markers.cognitiveDistortions) {
      const distortionCount = Object.values(markers.cognitiveDistortions)
        .reduce((sum, d) => sum + (d.count || 0), 0);
      if (distortionCount > 3) risk += 0.3;
    }

    return Math.min(1, risk);
  }

  generateLinguisticInsights(markers) {
    const insights = [];
    
    if (markers.absolutistLanguage && markers.absolutistLanguage.ratio > 0.1) {
      insights.push('Consider using more flexible language - try "sometimes" instead of "always/never"');
    }
    
    if (markers.selfReferentialLanguage && markers.selfReferentialLanguage.excessive) {
      insights.push('You might benefit from focusing on external activities or relationships');
    }

    return insights;
  }

  /**
   * BEHAVIORAL PATTERN ANALYSIS
   */
  analyzeBehavioralPatterns(conversations) {
    const patterns = {
      messagingFrequency: this.analyzeMessagingFrequency(conversations),
      responseLength: this.analyzeResponseLength(conversations),
      engagementLevel: this.analyzeEngagementLevel(conversations)
    };

    return {
      patterns,
      changes: this.detectBehavioralChanges(patterns),
      insights: this.generateBehavioralInsights(patterns)
    };
  }

  analyzeMessagingFrequency(conversations) {
    const last7Days = this.getRecentConversations(conversations, 7);
    const last14Days = this.getRecentConversations(conversations, 14);

    const recent = last7Days.length;
    const baseline = (last14Days.length - last7Days.length);

    return {
      recent,
      baseline,
      change: baseline > 0 ? (recent - baseline) / baseline : 0,
      pattern: recent > baseline * 1.5 ? 'INCREASED' : 
               recent < baseline * 0.5 ? 'DECREASED' : 'STABLE'
    };
  }

  analyzeResponseLength(conversations) {
    const recentMessages = this.getRecentMessages(conversations, 7);
    const lengths = recentMessages.map(msg => msg.text.length);
    
    if (lengths.length === 0) return { average: 0, variance: 0, trend: 'STABLE' };

    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;

    return {
      average: avgLength,
      variance,
      trend: 'STABLE' // Simplified for now
    };
  }

  analyzeEngagementLevel(conversations) {
    const recent = this.getRecentConversations(conversations, 7);
    const totalMessages = recent.reduce((sum, conv) => sum + (conv.messages || []).length, 0);
    
    return {
      totalMessages,
      conversationsPerDay: recent.length / 7,
      messagesPerConversation: recent.length > 0 ? totalMessages / recent.length : 0
    };
  }

  detectBehavioralChanges(patterns) {
    const changes = [];
    
    if (patterns.messagingFrequency.pattern === 'DECREASED') {
      changes.push('Reduced conversation frequency detected');
    }
    
    if (patterns.messagingFrequency.pattern === 'INCREASED') {
      changes.push('Increased conversation frequency - may indicate need for support');
    }

    return changes;
  }

  generateBehavioralInsights(patterns) {
    const insights = [];
    
    if (patterns.engagementLevel.conversationsPerDay < 0.5) {
      insights.push('Consider regular check-ins for better mental health tracking');
    }

    return insights;
  }

  /**
   * PREDICTIVE RISK ASSESSMENT
   */
  generateRiskPrediction(conversations, userProfile) {
    // Convert conversations object to array if needed
    const conversationArray = Array.isArray(conversations) ? conversations : Object.values(conversations);
    
    const temporal = this.analyzeTemporalPatterns(conversationArray);
    const behavioral = this.analyzeBehavioralPatterns(conversationArray);
    
    // Get recent messages for linguistic analysis
    const recentMessages = this.getRecentMessages(conversationArray, 3);
    const combinedText = recentMessages.map(m => m.text).join(' ');
    const linguistic = this.analyzeLinguisticBiomarkers(combinedText);

    const prediction = {
      overallRisk: this.calculateOverallRisk(temporal, behavioral, linguistic),
      confidence: this.calculateConfidence(conversationArray.length),
      timeframe: '7-14 days',
      earlyWarnings: [...temporal.earlyWarnings],
      recommendations: this.generatePersonalizedRecommendations(temporal, behavioral, linguistic, userProfile),
      interventions: this.suggestInterventions(temporal, behavioral, linguistic, userProfile)
    };

    // Store pattern for future learning
    this.updatePatterns(temporal, behavioral, linguistic);

    return prediction;
  }

  calculateOverallRisk(temporal, behavioral, linguistic) {
    const weights = {
      temporal: 0.4,
      behavioral: 0.3,
      linguistic: 0.3
    };

    const temporalRisk = temporal.moodTrend.slope < -0.2 ? 0.7 : 
                        temporal.moodTrend.slope < 0 ? 0.4 : 0.2;
    
    const behavioralRisk = behavioral.patterns.messagingFrequency.pattern === 'DECREASED' ? 0.6 :
                          behavioral.patterns.messagingFrequency.pattern === 'INCREASED' ? 0.5 : 0.3;
    
    const linguisticRisk = linguistic.riskScore;

    const overall = (temporalRisk * weights.temporal) + 
                   (behavioralRisk * weights.behavioral) + 
                   (linguisticRisk * weights.linguistic);

    return {
      score: overall,
      level: overall > 0.7 ? 'HIGH' : overall > 0.4 ? 'MODERATE' : 'LOW',
      breakdown: { temporal: temporalRisk, behavioral: behavioralRisk, linguistic: linguisticRisk }
    };
  }

  generatePersonalizedRecommendations(temporal, behavioral, linguistic, userProfile) {
    const recommendations = [];
    const personality = userProfile?.personality || 'creative';

    // Personalized based on personality type
    if (temporal.moodTrend.slope < -0.2) {
      const moodRecs = {
        'fitness': ['Try a gentle 15-minute walk', 'Do some stretching exercises'],
        'creative': ['Try drawing your emotions', 'Write in a journal'],
        'techy': ['Use a meditation app', 'Try digital detox periods'],
        'foody': ['Cook a comforting meal', 'Try herbal teas'],
        'bookworm': ['Read something inspiring', 'Practice gratitude journaling']
      };
      recommendations.push(...(moodRecs[personality] || moodRecs.creative));
    }

    if (linguistic.markers.absolutistLanguage && linguistic.markers.absolutistLanguage.ratio > 0.1) {
      recommendations.push('Practice flexible thinking - try replacing "always/never" with "sometimes"');
    }

    if (behavioral.patterns.messagingFrequency.pattern === 'INCREASED') {
      recommendations.push('Consider if you need additional support - it\'s okay to reach out');
    }

    // Ensure we always have some recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Continue your self-care routine',
        'Practice mindfulness throughout the day',
        'Maintain social connections'
      );
    }

    return recommendations.slice(0, 4); // Limit to top 4
  }

  suggestInterventions(temporal, behavioral, linguistic, userProfile) {
    // Simplified intervention suggestions
    return [
      'Daily mood check-ins',
      'Mindfulness practice',
      'Regular sleep schedule',
      'Social connection'
    ];
  }

  calculateVariation(numbers) {
    if (numbers.length <= 1) return 0;
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  // Utility methods
  getRecentConversations(conversations, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return conversations.filter(conv => {
      const convDate = new Date(conv.timestamp || conv.createdAt || Date.now());
      return convDate >= cutoff;
    });
  }

  getRecentMessages(conversations, days) {
    const recentConvs = this.getRecentConversations(conversations, days);
    return recentConvs.flatMap(conv => 
      (conv.messages || []).filter(m => m.sender === 'user')
    );
  }

  calculateConfidence(conversationCount) {
    // Confidence increases with more data
    return Math.min(1, conversationCount / 10);
  }

  // Save patterns for learning
  updatePatterns(temporal, behavioral, linguistic) {
    this.patterns.temporalTrends.push({
      timestamp: new Date().toISOString(),
      moodTrend: temporal.moodTrend,
      behavioralPatterns: behavioral.patterns,
      linguisticMarkers: linguistic.markers
    });

    // Keep only last 30 days of patterns
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    this.patterns.temporalTrends = this.patterns.temporalTrends.filter(
      p => new Date(p.timestamp) >= cutoff
    );

    localStorage.setItem('healwise_patterns', JSON.stringify(this.patterns));
  }
}

export default EarlyDetectionEngine;