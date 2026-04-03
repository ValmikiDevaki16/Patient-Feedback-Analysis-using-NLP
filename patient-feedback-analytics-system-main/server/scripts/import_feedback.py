import csv
import os
from datetime import datetime
from pymongo import MongoClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDBACK_CSV = os.path.join(BASE_DIR, 'storage', 'feedback.csv')
USERS_CSV = os.path.join(BASE_DIR, 'storage', 'users.csv')
ENV_FILE = os.path.join(BASE_DIR, '.env')

# load MONGODB_URI from .env
MONGODB_URI = None
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, 'r', encoding='utf8') as ef:
        for line in ef:
            if line.strip().startswith('MONGODB_URI='):
                MONGODB_URI = line.strip().split('=',1)[1]
                break

if not MONGODB_URI:
    raise SystemExit('MONGODB_URI not found in .env')

print('Using MongoDB URI:', MONGODB_URI[:40] + '...')

# build staffId -> name map from users.csv
staff_name = {}
if os.path.exists(USERS_CSV):
    with open(USERS_CSV, newline='', encoding='utf8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            sid = (r.get('staffId') or '').strip()
            name = (r.get('name') or '').strip()
            if sid:
                staff_name[sid.upper()] = name

# connect MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_default_database()
feedback_coll = db.get_collection('feedbacks')

# read feedback CSV
rows = []
with open(FEEDBACK_CSV, newline='', encoding='utf8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        rows.append(r)

print('Total rows in feedback.csv:', len(rows))

insert_count = 0
for r in rows:
    created_str = (r.get('createdAt') or '').strip()
    if not created_str:
        created = datetime.utcnow()
    else:
        try:
            created = datetime.fromisoformat(created_str.replace('Z','+00:00'))
        except Exception:
            # try fallback
            created = datetime.utcnow()

    # avoid duplicate based on createdAt + staffId + text
    staffId = (r.get('doctorId') or '').strip() or None
    text = (r.get('text') or '').strip() or ''
    existing = feedback_coll.find_one({'createdAt': created, 'staffId': staffId, 'text': text})
    if existing:
        continue

    sentiment_raw = (r.get('sentiment') or '').strip().lower()
    sentiment = 'Neutral'
    if sentiment_raw.startswith('pos'):
        sentiment = 'Positive'
    elif sentiment_raw.startswith('neg'):
        sentiment = 'Negative'

    try:
        polarity = float(r.get('sentimentScore') or r.get('polarity') or 0)
    except:
        polarity = 0.0

    try:
        rating = int(r.get('rating') or 0)
    except:
        rating = 0

    doc = {
        'text': text,
        'department': 'OPD',
        'sentiment': sentiment,
        'polarityScore': polarity,
        'sentimentScore': polarity,
        'emotion': 'neutral',
        'category': 'General',
        'severityScore': max(1, min(10, (6 - rating) * 2)) if rating else 5,
        'keywords': [],
        'patientName': r.get('patientId') or 'Anon',
        'patientId': r.get('patientId') or 'Anon',
        'staffId': staffId,
        'staffName': staff_name.get((staffId or '').upper()) if staffId else None,
        'doctorRating': rating,
        'createdAt': created,
    }

    feedback_coll.insert_one(doc)
    insert_count += 1

print('Inserted', insert_count, 'new feedback documents')
client.close()
