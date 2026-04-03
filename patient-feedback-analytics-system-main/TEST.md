# MediFeedback AI - Execution Commands

## Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- MongoDB (running on localhost:27017)

## Backend Setup
```bash
cd server
npm install
npm run dev
```

## NLP Service Setup
```bash
cd nlp_service
pip install -r requirements.txt
python app.py
```

## Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Access Credentials
- Clerk Secret: `secure_clerk_key_2024`
- Admin Password: `admin@hospital2024`

## Ports
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- NLP Service: http://localhost:5001
