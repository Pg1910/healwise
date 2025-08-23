/**
 * Privacy-safe data export for healthcare providers or personal records
 */

class DataExporter {
  static generateWellnessReport(conversations, userProfile, includePersonalData = false) {
    const manager = new ConversationManager();
    const insights = manager.generateInsights();
    
    const report = {
      generatedAt: new Date().toISOString(),
      reportType: 'Mental Wellness Summary',
      timeframe: '30 days',
      anonymized: !includePersonalData,
      
      summary: {
        totalSessions: Object.keys(conversations).length,
        averageWellnessScore: this.calculateAverageWellness(conversations),
        predominantEmotions: insights.topEmotions.slice(0, 3),
        overallTrend: insights.overallProgress
      },
      
      insights: {
        earlyWarnings: this.getEarlyWarningHistory(),
        progressMilestones: insights.milestones,
        recommendationsFollowed: this.getRecommendationCompliance()
      },
      
      // Only include if user explicitly consents
      ...(includePersonalData && {
        userProfile: {
          name: userProfile?.name,
          personality: userProfile?.personality,
          preferences: userProfile?.botPersona
        }
      })
    };

    return report;
  }

  static exportToPDF(report) {
    // Generate downloadable PDF report
    const content = this.formatReportHTML(report);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `healwise-wellness-report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  static generateShareableInsights(conversations, anonymous = true) {
    // Generate insights that can be safely shared with healthcare providers
    return {
      riskLevelTrends: this.getRiskTrends(conversations),
      emotionalPatterns: this.getEmotionalPatterns(conversations, anonymous),
      interventionEffectiveness: this.getInterventionResults(conversations),
      recommendationsForCare: this.generateCareRecommendations(conversations)
    };
  }
}

export default DataExporter;