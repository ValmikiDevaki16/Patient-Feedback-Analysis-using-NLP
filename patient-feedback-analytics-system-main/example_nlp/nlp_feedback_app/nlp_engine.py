import re
from collections import Counter

class NLPProcessor:
    def __init__(self):
        self.negative_keywords = [
            'bad', 'terrible', 'worst', 'horrible', 'poor', 'awful', 'disappointing',
            'rude', 'unprofessional', 'dirty', 'filthy', 'long wait', 'delayed',
            'emergency', 'urgent', 'pain', 'suffering', 'neglect', 'ignored'
        ]

        self.positive_keywords = [
            'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic',
            'professional', 'caring', 'clean', 'quick', 'efficient', 'helpful',
            'friendly', 'compassionate', 'thorough'
        ]

        self.emotion_keywords = {
            'Anger': ['angry', 'furious', 'frustrated', 'annoyed', 'rude', 'disrespectful'],
            'Joy': ['happy', 'pleased', 'satisfied', 'grateful', 'thankful', 'appreciate'],
            'Sadness': ['sad', 'disappointed', 'upset', 'unhappy', 'depressed'],
            'Fear': ['scared', 'worried', 'anxious', 'nervous', 'concerned', 'afraid'],
            'Trust': ['trust', 'confident', 'reliable', 'professional', 'competent']
        }

        self.category_keywords = {
            'Staff Behaviour': ['staff', 'doctor', 'nurse', 'rude', 'friendly', 'professional', 'helpful', 'caring'],
            'Waiting Time': ['wait', 'delay', 'long', 'queue', 'appointment', 'time', 'hours'],
            'Cleanliness': ['clean', 'dirty', 'hygiene', 'sanitize', 'smell', 'filthy', 'tidy'],
            'Facilities': ['facility', 'equipment', 'room', 'bed', 'toilet', 'parking', 'building'],
            'Overall Experience': ['experience', 'overall', 'general', 'visit', 'stay']
        }

        self.severity_indicators = [
            'emergency', 'urgent', 'critical', 'serious', 'life', 'death',
            'dangerous', 'severe', 'worst', 'terrible', 'awful'
        ]

    def analyze_feedback(self, text):
        text_lower = text.lower()

        sentiment, sentiment_score = self._analyze_sentiment(text_lower)
        emotion = self._detect_emotion(text_lower)
        category = self._categorize_feedback(text_lower)
        severity_score = self._calculate_severity(text_lower, sentiment)
        keywords = self._extract_keywords(text_lower)

        return {
            'sentiment': sentiment,
            'sentiment_score': sentiment_score,
            'emotion': emotion,
            'category': category,
            'severity_score': severity_score,
            'keywords': keywords
        }

    def _analyze_sentiment(self, text):
        # Use regex to match whole words and phrases
        positive_count = 0
        negative_count = 0
        for word in self.positive_keywords:
            # Match whole word or phrase
            if re.search(r'\b' + re.escape(word) + r'\b', text):
                positive_count += 1
        for word in self.negative_keywords:
            if re.search(r'\b' + re.escape(word) + r'\b', text):
                negative_count += 1
        # Also check for negative multi-word phrases
        negative_phrases = ['dirty room', 'filthy room', 'long wait', 'rude staff', 'unprofessional staff']
        for phrase in negative_phrases:
            if phrase in text:
                negative_count += 2  # Stronger negative impact
        if negative_count > positive_count:
            sentiment = 'Negative'
            score = max(1, min(10, 3 + negative_count))
        elif positive_count > negative_count:
            sentiment = 'Positive'
            score = max(1, min(10, 7 + positive_count))
        else:
            sentiment = 'Neutral'
            score = 5
        return sentiment, score

    def _detect_emotion(self, text):
        emotion_scores = {}

        for emotion, keywords in self.emotion_keywords.items():
            score = sum(1 for word in keywords if word in text)
            if score > 0:
                emotion_scores[emotion] = score

        if emotion_scores:
            return max(emotion_scores, key=emotion_scores.get)
        return 'Neutral'

    def _categorize_feedback(self, text):
        category_scores = {}

        for category, keywords in self.category_keywords.items():
            score = sum(1 for word in keywords if word in text)
            if score > 0:
                category_scores[category] = score

        if category_scores:
            return max(category_scores, key=category_scores.get)
        return 'Overall Experience'

    def _calculate_severity(self, text, sentiment):
        severity = 5

        if sentiment == 'Negative':
            severity += 2
        elif sentiment == 'Positive':
            severity -= 2

        for indicator in self.severity_indicators:
            if indicator in text:
                severity += 1

        return max(1, min(10, severity))

    def _extract_keywords(self, text):
        words = re.findall(r'\b\w+\b', text)

        stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'was', 'were', 'been'}
        filtered_words = [word for word in words if word not in stop_words and len(word) > 3]

        word_counts = Counter(filtered_words)
        return [word for word, count in word_counts.most_common(5)]

    def generate_recommendations(self, feedbacks):
        recommendations = []

        category_severity = {}
        for fb in feedbacks:
            category = fb['category']
            if category not in category_severity:
                category_severity[category] = []
            category_severity[category].append(fb['severity_score'])

        for category, severities in category_severity.items():
            avg_severity = sum(severities) / len(severities)

            if avg_severity >= 7:
                if category == 'Staff Behaviour':
                    recommendations.append({
                        'category': category,
                        'severity': 'High',
                        'recommendation': 'Conduct staff training on patient interaction and empathy. Review complaints and provide feedback.'
                    })
                elif category == 'Waiting Time':
                    recommendations.append({
                        'category': category,
                        'severity': 'High',
                        'recommendation': 'Optimize OPD scheduling. Consider hiring additional staff during peak hours.'
                    })
                elif category == 'Cleanliness':
                    recommendations.append({
                        'category': category,
                        'severity': 'High',
                        'recommendation': 'Increase frequency of cleaning rounds. Conduct hygiene audits and staff accountability checks.'
                    })
                elif category == 'Facilities':
                    recommendations.append({
                        'category': category,
                        'severity': 'High',
                        'recommendation': 'Assess equipment functionality. Budget for facility upgrades and maintenance.'
                    })

        if not recommendations:
            recommendations.append({
                'category': 'Overall',
                'severity': 'Good',
                'recommendation': 'Maintain current standards. Continue monitoring feedback for early issue detection.'
            })

        return recommendations
