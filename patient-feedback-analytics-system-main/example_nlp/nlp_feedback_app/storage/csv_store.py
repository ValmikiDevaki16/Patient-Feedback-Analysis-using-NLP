import csv
import os
import json
from threading import Lock

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CSV_PATH = os.path.join(DATA_DIR, 'feedback.csv')
_lock = Lock()
HEADERS = [
    'id', 'feedback_text', 'department', 'sentiment', 'sentiment_score',
    'emotion', 'category', 'severity_score', 'keywords', 'created_at'
]


def _ensure_csv():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS)
            writer.writeheader()


def _next_id(rows):
    if not rows:
        return 1
    try:
        last = max(int(r.get('id', 0)) for r in rows)
        return last + 1
    except Exception:
        return len(rows) + 1


def save_feedback(entry: dict):
    """Append a feedback entry to the CSV. Returns the saved entry with `id`."""
    _ensure_csv()
    with _lock:
        rows = read_all_feedbacks()
        new_id = _next_id(rows)
        entry_copy = entry.copy()
        entry_copy['id'] = new_id
        # Ensure keys exist and serialize keywords
        entry_copy['keywords'] = json.dumps(entry_copy.get('keywords', [])) if not isinstance(entry_copy.get('keywords', ''), str) else entry_copy.get('keywords', '')

        # Write row
        with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS)
            writer.writerow({k: entry_copy.get(k, '') for k in HEADERS})

    return entry_copy


def read_all_feedbacks():
    """Return list of feedback dicts read from CSV (with types cast where appropriate)."""
    _ensure_csv()
    rows = []
    with _lock:
        with open(CSV_PATH, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for r in reader:
                # Cast numeric fields
                try:
                    r['id'] = int(r.get('id') or 0)
                except Exception:
                    r['id'] = r.get('id')
                try:
                    r['sentiment_score'] = float(r.get('sentiment_score') or 0)
                except Exception:
                    r['sentiment_score'] = 0
                try:
                    r['severity_score'] = float(r.get('severity_score') or 0)
                except Exception:
                    r['severity_score'] = 0

                # Parse keywords JSON if present
                k = r.get('keywords', '')
                if k:
                    try:
                        r['keywords'] = json.loads(k)
                    except Exception:
                        # fallback: simple split
                        r['keywords'] = [x.strip() for x in k.strip('[]').split(',') if x.strip()]
                else:
                    r['keywords'] = []

                rows.append(r)

    return rows
