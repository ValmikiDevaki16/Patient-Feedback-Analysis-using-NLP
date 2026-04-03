import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
from datetime import datetime
from nlp_engine import NLPProcessor
from storage.csv_store import save_feedback, read_all_feedbacks

load_dotenv()

app = Flask(__name__)
CORS(app)


# Using CSV-based storage instead of Supabase


nlp_processor = NLPProcessor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        if data is None:
            return jsonify({'error': 'Invalid JSON format'}), 400

        feedback_text = data.get('feedback', '')
        department = data.get('department', 'General')

        if not feedback_text:
            return jsonify({'error': 'Feedback text is required'}), 400

        analysis = nlp_processor.analyze_feedback(feedback_text)

        feedback_entry = {
            'feedback_text': feedback_text,
            'department': department,
            'sentiment': analysis['sentiment'],
            'sentiment_score': analysis['sentiment_score'],
            'emotion': analysis['emotion'],
            'category': analysis['category'],
            'severity_score': analysis['severity_score'],
            'keywords': json.dumps(analysis['keywords']),
            'created_at': datetime.now().isoformat()
        }

        saved = save_feedback(feedback_entry)

        return jsonify({
            'success': True,
            'analysis': analysis,
            'saved_id': saved.get('id'),
            'message': f"Thank you for your feedback. We've noted your concern regarding {analysis['category']}."
        })

    except Exception as e:
        print(f"Error submitting feedback: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        feedbacks = read_all_feedbacks()

        if not feedbacks:
            return jsonify({
                'total_feedback': 0,
                'avg_sentiment_score': 0,
                'critical_issues': 0,
                'sentiment_distribution': {},
                'category_distribution': {},
                'department_ratings': {},
                'recent_feedback': []
            })
        # feedbacks is a list of dicts from CSV
        total = len(feedbacks)

        sentiment_counts = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
        category_counts = {}
        department_scores = {}
        critical_count = 0
        total_score = 0

        for fb in feedbacks:
            sentiment_counts[fb['sentiment']] = sentiment_counts.get(fb['sentiment'], 0) + 1
            category_counts[fb['category']] = category_counts.get(fb['category'], 0) + 1

            if fb['department'] not in department_scores:
                department_scores[fb['department']] = []
            department_scores[fb['department']].append(fb['sentiment_score'])

            if fb['severity_score'] >= 7:
                critical_count += 1

            total_score += fb['sentiment_score']

        department_ratings = {
            dept: round(sum(scores) / len(scores), 2)
            for dept, scores in department_scores.items()
        }

        recommendations = nlp_processor.generate_recommendations(feedbacks)

        return jsonify({
            'total_feedback': total,
            'avg_sentiment_score': round(total_score / total, 2) if total > 0 else 0,
            'critical_issues': critical_count,
            'sentiment_distribution': sentiment_counts,
            'category_distribution': category_counts,
            'department_ratings': department_ratings,
            'recent_feedback': feedbacks[-10:],
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/severity-heatmap', methods=['GET'])
def get_severity_heatmap():
    try:
        feedbacks = read_all_feedbacks()

        heatmap_data = {}

        for fb in feedbacks:
            key = f"{fb['department']}_{fb['category']}"
            if key not in heatmap_data:
                heatmap_data[key] = {
                    'department': fb['department'],
                    'category': fb['category'],
                    'severities': []
                }
            heatmap_data[key]['severities'].append(fb['severity_score'])

        heatmap_result = []
        for key, data in heatmap_data.items():
            avg_severity = sum(data['severities']) / len(data['severities'])
            heatmap_result.append({
                'department': data['department'],
                'category': data['category'],
                'avg_severity': round(avg_severity, 2)
            })

        return jsonify(heatmap_result)

    except Exception as e:
        print(f"Error generating heatmap: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-feedback', methods=['POST'])
def save_feedback_api():
    """Save feedback data to CSV file"""
    try:
        feedbacks = request.json
        if not feedbacks:
            return jsonify({'error': 'No feedback data provided'}), 400
        
        # Save each feedback entry
        for fb in feedbacks:
            feedback_entry = {
                'feedback_text': fb.get('feedback_text', ''),
                'department': fb.get('department', 'General'),
                'sentiment': fb.get('sentiment', ''),
                'sentiment_score': fb.get('sentiment_score', 0),
                'emotion': fb.get('emotion', ''),
                'category': fb.get('category', ''),
                'severity_score': fb.get('severity_score', 0),
                'keywords': json.dumps(fb.get('keywords', [])) if isinstance(fb.get('keywords'), list) else fb.get('keywords', ''),
                'created_at': fb.get('created_at', datetime.now().isoformat())
            }
            save_feedback(feedback_entry)
        
        return jsonify({'success': True, 'message': f'Saved {len(feedbacks)} feedback entries'})
    except Exception as e:
        print(f"Error saving feedback: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
