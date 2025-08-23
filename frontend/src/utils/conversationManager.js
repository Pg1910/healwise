/**
 * Enhanced conversation management with pattern tracking
 */

class ConversationManager {
  constructor() {
    this.conversations = this.loadConversations();
    this.analytics = this.loadAnalytics();
  }

  loadConversations() {
    const saved = localStorage.getItem('healwise_conversations');
    return saved ? JSON.parse(saved) : {};
  }

  loadAnalytics() {
    const saved = localStorage.getItem('healwise_analytics');
    return saved ? JSON.parse(saved) : {
      totalSessions: 0,
      averageSessionLength: 0,
      moodTrends: [],
      topEmotions: {},
      wellnessMilestones: []
    };
  }

  addMessage(conversationId, message, analysis) {
    if (!this.conversations[conversationId]) {
      this.conversations[conversationId] = {
        id: conversationId,
        createdAt: new Date().toISOString(),
        messages: [],
        summary: '',
        overallMood: 'neutral'
      };
      this.analytics.totalSessions++;
    }

    const enrichedMessage = {
      ...message,
      analysis,
      timestamp: new Date().toISOString(),
      wellnessScore: this.calculateWellnessScore(analysis)
    };

    this.conversations[conversationId].messages.push(enrichedMessage);
    this.updateAnalytics(enrichedMessage);
    this.persistData();

    return enrichedMessage;
  }

  calculateWellnessScore(analysis) {
    if (!analysis?.probs) return 0.5;
    
    const positiveEmotions = ['joy', 'optimism', 'gratitude', 'love', 'excitement'];
    const negativeEmotions = ['sadness', 'fear', 'anger', 'anxiety', 'despair'];
    
    let score = 0.5; // Neutral baseline
    
    positiveEmotions.forEach(emotion => {
      if (analysis.probs[emotion]) score += analysis.probs[emotion] * 0.3;
    });
    
    negativeEmotions.forEach(emotion => {
      if (analysis.probs[emotion]) score -= analysis.probs[emotion] * 0.3;
    });
    
    return Math.max(0, Math.min(1, score));
  }

  updateAnalytics(message) {
    // Track mood trends
    this.analytics.moodTrends.push({
      timestamp: message.timestamp,
      score: message.wellnessScore,
      primaryEmotion: this.getPrimaryEmotion(message.analysis)
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.analytics.moodTrends = this.analytics.moodTrends.filter(
      trend => new Date(trend.timestamp) >= thirtyDaysAgo
    );

    // Update top emotions
    if (message.analysis?.probs) {
      Object.entries(message.analysis.probs).forEach(([emotion, prob]) => {
        this.analytics.topEmotions[emotion] = (this.analytics.topEmotions[emotion] || 0) + prob;
      });
    }
  }

  getPrimaryEmotion(analysis) {
    if (!analysis?.probs) return 'neutral';
    return Object.entries(analysis.probs)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  persistData() {
    localStorage.setItem('healwise_conversations', JSON.stringify(this.conversations));
    localStorage.setItem('healwise_analytics', JSON.stringify(this.analytics));
  }

  generateInsights() {
    const last7Days = this.getMoodTrend(7);
    const last30Days = this.getMoodTrend(30);
    
    return {
      recentTrend: this.calculateTrendDirection(last7Days),
      overallProgress: this.calculateTrendDirection(last30Days),
      topEmotions: this.getTopEmotions(5),
      streaks: this.calculateStreaks(),
      milestones: this.identifyMilestones()
    };
  }

  getMoodTrend(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.analytics.moodTrends.filter(
      trend => new Date(trend.timestamp) >= cutoff
    );
  }

  calculateTrendDirection(trends) {
    if (trends.length < 2) return 'stable';
    
    const recent = trends.slice(-Math.min(3, trends.length));
    const earlier = trends.slice(0, Math.min(3, trends.length));
    
    const recentAvg = recent.reduce((sum, t) => sum + t.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, t) => sum + t.score, 0) / earlier.length;
    
    const change = recentAvg - earlierAvg;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }
}

export default ConversationManager;