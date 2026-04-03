/**
 * Client-side NLP Feedback Processor
 * Implements sentiment analysis, emotion detection, categorization, and severity scoring
 */

class FeedbackProcessor {
  constructor() {
    this.negativeKeywords = [
      "bad",
      "terrible",
      "worst",
      "horrible",
      "poor",
      "awful",
      "disappointing",
      "rude",
      "unprofessional",
      "dirty",
      "filthy",
      "long wait",
      "delayed",
      "emergency",
      "urgent",
      "pain",
      "suffering",
      "neglect",
      "ignored",
    ];

    this.positiveKeywords = [
      "good",
      "great",
      "excellent",
      "wonderful",
      "amazing",
      "fantastic",
      "professional",
      "caring",
      "clean",
      "quick",
      "efficient",
      "helpful",
      "friendly",
      "compassionate",
      "thorough",
    ];

    this.emotionKeywords = {
      Anger: [
        "angry",
        "furious",
        "frustrated",
        "annoyed",
        "rude",
        "disrespectful",
      ],
      Joy: [
        "happy",
        "pleased",
        "satisfied",
        "grateful",
        "thankful",
        "appreciate",
      ],
      Sadness: ["sad", "disappointed", "upset", "unhappy", "depressed"],
      Fear: ["scared", "worried", "anxious", "nervous", "concerned", "afraid"],
      Trust: ["trust", "confident", "reliable", "professional", "competent"],
    };

    this.categoryKeywords = {
      "Staff Behaviour": [
        "staff",
        "doctor",
        "nurse",
        "rude",
        "friendly",
        "professional",
        "helpful",
        "caring",
      ],
      "Waiting Time": [
        "wait",
        "delay",
        "long",
        "queue",
        "appointment",
        "time",
        "hours",
      ],
      Cleanliness: [
        "clean",
        "dirty",
        "hygiene",
        "sanitize",
        "smell",
        "filthy",
        "tidy",
      ],
      Facilities: [
        "facility",
        "equipment",
        "room",
        "bed",
        "toilet",
        "parking",
        "building",
      ],
      "Overall Experience": [
        "experience",
        "overall",
        "general",
        "visit",
        "stay",
      ],
    };

    this.severityIndicators = [
      "emergency",
      "urgent",
      "critical",
      "serious",
      "life",
      "death",
      "dangerous",
      "severe",
      "worst",
      "terrible",
      "awful",
    ];
  }

  analyzeFeedback(text) {
    const textLower = text.toLowerCase();
    const sentiment = this._analyzeSentiment(textLower);
    const emotion = this._detectEmotion(textLower);
    const category = this._categorizeFeedback(textLower);
    const severityScore = this._calculateSeverity(
      textLower,
      sentiment.sentiment
    );
    const keywords = this._extractKeywords(textLower);

    return {
      sentiment: sentiment.sentiment,
      sentiment_score: sentiment.score,
      emotion: emotion,
      category: category,
      severity_score: severityScore,
      keywords: keywords,
    };
  }

  _analyzeSentiment(text) {
    const positiveCount = this.positiveKeywords.filter((word) =>
      text.includes(word)
    ).length;
    const negativeCount = this.negativeKeywords.filter((word) =>
      text.includes(word)
    ).length;

    let sentiment, score;
    if (negativeCount > positiveCount) {
      sentiment = "Negative";
      score = Math.max(1, Math.min(10, 3 + negativeCount));
    } else if (positiveCount > negativeCount) {
      sentiment = "Positive";
      score = Math.max(1, Math.min(10, 7 + positiveCount));
    } else {
      sentiment = "Neutral";
      score = 5;
    }

    return { sentiment, score };
  }

  _detectEmotion(text) {
    const emotionScores = {};

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      const score = keywords.filter((word) => text.includes(word)).length;
      if (score > 0) {
        emotionScores[emotion] = score;
      }
    }

    if (Object.keys(emotionScores).length > 0) {
      return Object.keys(emotionScores).reduce((a, b) =>
        emotionScores[a] > emotionScores[b] ? a : b
      );
    }
    return "Neutral";
  }

  _categorizeFeedback(text) {
    const categoryScores = {};

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const score = keywords.filter((word) => text.includes(word)).length;
      if (score > 0) {
        categoryScores[category] = score;
      }
    }

    if (Object.keys(categoryScores).length > 0) {
      return Object.keys(categoryScores).reduce((a, b) =>
        categoryScores[a] > categoryScores[b] ? a : b
      );
    }
    return "Overall Experience";
  }

  _calculateSeverity(text, sentiment) {
    let severity = 5;

    if (sentiment === "Negative") {
      severity += 2;
    } else if (sentiment === "Positive") {
      severity -= 2;
    }

    const indicatorCount = this.severityIndicators.filter((indicator) =>
      text.includes(indicator)
    ).length;
    severity += indicatorCount;

    return Math.max(1, Math.min(10, severity));
  }

  _extractKeywords(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const stopWords = new Set([
      "the",
      "is",
      "at",
      "which",
      "on",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "with",
      "to",
      "for",
      "of",
      "was",
      "were",
      "been",
    ]);

    const filtered = words.filter(
      (word) => !stopWords.has(word) && word.length > 3
    );
    const counts = {};
    filtered.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);
  }

  generateRecommendations(feedbacks) {
    const recommendations = [];
    const categoryInfo = {};

    feedbacks.forEach((fb) => {
      if (!categoryInfo[fb.category]) {
        categoryInfo[fb.category] = [];
      }
      categoryInfo[fb.category].push(fb.severity_score);
    });

    for (const [category, scores] of Object.entries(categoryInfo)) {
      const avgSeverity = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (avgSeverity >= 7) {
        const rec = this._getRecommendationForCategory(category, avgSeverity);
        recommendations.push(rec);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: "Overall",
        severity: "Good",
        recommendation:
          "Maintain current standards. Continue monitoring feedback for early issue detection.",
      });
    }

    return recommendations;
  }

  _getRecommendationForCategory(category, severity) {
    const recommendations = {
      "Staff Behaviour": {
        category: category,
        severity: "High",
        recommendation:
          "Conduct staff training on patient interaction and empathy. Review complaints and provide feedback.",
      },
      "Waiting Time": {
        category: category,
        severity: "High",
        recommendation:
          "Optimize OPD scheduling. Consider hiring additional staff during peak hours.",
      },
      Cleanliness: {
        category: category,
        severity: "High",
        recommendation:
          "Increase frequency of cleaning rounds. Conduct hygiene audits and staff accountability checks.",
      },
      Facilities: {
        category: category,
        severity: "High",
        recommendation:
          "Assess equipment functionality. Budget for facility upgrades and maintenance.",
      },
      "Overall Experience": {
        category: category,
        severity: "Medium",
        recommendation:
          "Review overall patient journey and satisfaction trends. Implement targeted improvements.",
      },
    };

    return (
      recommendations[category] || {
        category: category,
        severity: "Medium",
        recommendation: "Monitor and address reported issues.",
      }
    );
  }
}

// Global instance
const feedbackProcessor = new FeedbackProcessor();
