from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
from textblob import download_corpora
import nltk
from collections import Counter
import re

app = Flask(__name__)
CORS(app)

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Ensure TextBlob corpora are available (downloads if missing)
try:
    download_corpora.download_all()
except Exception:
    # If automatic download fails, continue and let endpoints return errors with helpful messages
    pass

# Keyword mappings for category detection
CATEGORY_KEYWORDS = {
    'Wait Time': ['wait', 'waiting', 'long', 'delay', 'queue', 'hours', 'appointment', 'slow'],
    'Staff Behavior': ['staff', 'doctor', 'nurse', 'rude', 'polite', 'helpful', 'friendly', 'unprofessional', 'behavior'],
    'Cleanliness': ['clean', 'dirty', 'hygienic', 'filthy', 'neat', 'mess', 'sanitation'],
    'Food Quality': ['food', 'meal', 'lunch', 'breakfast', 'dinner', 'taste', 'cafeteria', 'quality'],
    'Medical Care': ['treatment', 'medicine', 'care', 'diagnosis', 'surgery', 'medication', 'doctor'],
    'Facilities': ['bed', 'room', 'equipment', 'ac', 'ventilation', 'facilities', 'parking', 'infrastructure'],
    'Cost': ['expensive', 'cost', 'price', 'bill', 'charge', 'fee', 'payment', 'affordable']
}

# Emotion detection based on keywords
EMOTION_KEYWORDS = {
    # Positive / Joy
    'positive': [
        'good', 'great', 'excellent', 'amazing', 'wonderful',
        'happy', 'satisfied', 'nice', 'fantastic', 'love'
    ],

    # Relief
    'relief': [
        'relieved', 'finally', 'at last', 'problem solved',
        'issue resolved', 'better now', 'improved'
    ],

    # Frustration
    'frustration': [
        'frustrated', 'annoyed', 'irritated', 'fed up',
        'tired of', 'disappointed', 'not again'
    ],

    # Anger
    'anger': [
        'angry', 'furious', 'rage', 'mad', 'outraged',
        'unacceptable', 'worst', 'hate'
    ],

    # Confusion
    'confusion': [
        'confused', 'don\'t understand', 'unclear',
        'not sure', 'what is going on', 'no idea'
    ],

    # Fallback
    'neutral': []
}


def detect_category(text):
    """Detect feedback category from text"""
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] = sum(1 for kw in keywords if kw in text_lower)
    
    if max(scores.values(), default=0) > 0:
        return max(scores, key=scores.get)
    return 'General'

def detect_emotion(text):
    """Detect emotion from text"""
    text_lower = text.lower()
    for emotion, keywords in EMOTION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return emotion
    return 'neutral'

def extract_keywords(text):
    """Extract important keywords from text"""
    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                  'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has',
                  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'it',
                  'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'he', 'she',
                  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'the', 'as', 'by'}
    
    words = re.findall(r'\b\w+\b', text.lower())
    filtered = [w for w in words if w not in stop_words and len(w) > 3]
    
    # Get most common keywords
    word_freq = Counter(filtered)
    return [word for word, _ in word_freq.most_common(5)]

def calculate_severity(text, polarity):
    """Calculate severity score (1-10) based on negative words and polarity"""
    negative_words = ['problem', 'issue', 'bad', 'terrible', 'horrible', 'worst', 'useless',
                      'waste', 'hate', 'worse', 'critical', 'urgent', 'emergency']
    
    negative_count = sum(1 for word in negative_words if word in text.lower())
    
    # Base severity on polarity and negative word count
    severity = 5  # neutral baseline
    severity += negative_count * 1.5  # add for each negative word
    severity += (min(polarity, 0) * 10)  # subtract for negative polarity
    
    return max(1, min(10, round(severity)))

@app.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.json
        text = data.get('text', '')
        department = data.get('department', 'General')

        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity

        if polarity > 0.1:
            sentiment = 'Positive'
        elif polarity < -0.1:
            sentiment = 'Negative'
        else:
            sentiment = 'Neutral'

        emotion = detect_emotion(text)
        category = detect_category(text)
        severity_score = calculate_severity(text, polarity)
        keywords = extract_keywords(text)

        return jsonify({
            'sentiment': sentiment,
            'polarity': round(polarity, 3),
            'sentimentScore': round(polarity, 3),
            'subjectivity': round(subjectivity, 3),
            'emotion': emotion,
            'category': category,
            'severity_score': severity_score,
            'keywords': keywords,
            'department': department
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_suggestions', methods=['POST'])
def generate_suggestions():
    try:
        data = request.json
        feedbacks = data.get('feedbacks', [])

        if not feedbacks:
            return jsonify({
                'suggestions': 'No negative feedback found. Keep up the good work!'
            })

        all_words = []
        for feedback in feedbacks:
            words = re.findall(r'\b\w+\b', feedback.lower())
            all_words.extend(words)

        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                      'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has',
                      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'it',
                      'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'he', 'she'}

        filtered_words = [w for w in all_words if w not in stop_words and len(w) > 3]
        word_freq = Counter(filtered_words)
        common_issues = word_freq.most_common(5)

        suggestions = "Based on negative feedback analysis:\n\n"

        issue_keywords = {
            'wait': 'Reduce patient waiting times by optimizing appointment scheduling',
            'waiting': 'Reduce patient waiting times by optimizing appointment scheduling',
            'long': 'Address long wait times with better queue management',
            'staff': 'Improve staff training and increase staffing during peak hours',
            'rude': 'Conduct customer service training for staff members',
            'dirty': 'Enhance cleaning protocols and facility maintenance',
            'clean': 'Enhance cleaning protocols and facility maintenance',
            'food': 'Review and improve cafeteria food quality and variety',
            'doctor': 'Improve doctor-patient communication and availability',
            'nurse': 'Enhance nurse responsiveness and patient care protocols',
            'expensive': 'Review pricing transparency and offer more payment options',
            'cost': 'Review pricing transparency and offer more payment options',
            'parking': 'Improve parking facilities and availability',
            'appointment': 'Streamline appointment booking and reminder systems'
        }

        found_suggestions = []
        for word, count in common_issues:
            for keyword, suggestion in issue_keywords.items():
                if keyword in word and suggestion not in found_suggestions:
                    found_suggestions.append(f"• {suggestion} (mentioned {count} times)")
                    break

        if found_suggestions:
            suggestions += '\n'.join(found_suggestions)
        else:
            suggestions += "• Review recent feedback for specific improvement areas\n"
            suggestions += "• Conduct patient satisfaction surveys\n"
            suggestions += "• Implement staff feedback collection system"

        suggestions += f"\n\nAnalyzed {len(feedbacks)} negative feedback entries."

        return jsonify({'suggestions': suggestions})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'NLP service is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
