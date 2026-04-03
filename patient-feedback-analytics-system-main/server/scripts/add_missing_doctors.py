import csv
from datetime import datetime
from collections import defaultdict

USERS_CSV = '../server/storage/users.csv'
FEEDBACK_CSV = '../server/storage/feedback.csv'

# Resolve relative path when script run from server/scripts; compute absolute
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_CSV = os.path.join(BASE_DIR, 'storage', 'users.csv')
FEEDBACK_CSV = os.path.join(BASE_DIR, 'storage', 'feedback.csv')

print('Using users:', USERS_CSV)
print('Using feedback:', FEEDBACK_CSV)

# Read existing users
existing = set()
with open(USERS_CSV, newline='', encoding='utf8') as f:
    reader = csv.DictReader(f)
    users_rows = list(reader)
    for r in users_rows:
        sid = (r.get('staffId') or '').strip()
        if sid:
            existing.add(sid.upper())

# Read feedback doctor IDs and map to specialization (take first seen)
doctor_spec = {}
with open(FEEDBACK_CSV, newline='', encoding='utf8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        did = (r.get('doctorId') or '').strip()
        spec = (r.get('specialization') or '').strip()
        if not did:
            continue
        did = did.upper()
        if did not in doctor_spec and spec:
            doctor_spec[did] = spec

# Find missing
missing = sorted([d for d in doctor_spec.keys() if d not in existing])
print('Found', len(doctor_spec), 'unique doctor IDs in feedback.csv')
print('Existing users in users.csv:', len(existing))
print('Missing doctors to add:', len(missing))
if missing:
    now = datetime.utcnow().isoformat() + 'Z'
    headers = ['staffId','name','role','department','specialization','email','phone','avatar','password','createdAt','updatedAt']
    with open(USERS_CSV, 'a', newline='', encoding='utf8') as f:
        writer = csv.writer(f)
        for did in missing:
            name = f'Dr {did}' if did.upper().startswith('DOC') else did
            role = 'Doctor' if did.upper().startswith('DOC') else 'Staff'
            dept = 'OPD'
            spec = doctor_spec.get(did, 'General')
            email = ''
            phone = ''
            avatar = ''
            password = f'{did}Pass!'
            row = [did, name, role, dept, spec, email, phone, avatar, password, now, now]
            writer.writerow(row)
            print('Added', did)
    print('Appended', len(missing), 'rows to users.csv')
else:
    print('No missing doctors found. No changes made.')
