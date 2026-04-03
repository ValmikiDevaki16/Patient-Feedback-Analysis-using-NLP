# MediFeedback AI - Project Structure

```
medifeedback-ai/
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminChatbot.jsx    # AI Analyst chatbot for admin
│   │   │   ├── AnalyticsCharts.jsx # Recharts pie & line charts
│   │   │   └── PatientChatbot.jsx  # FAQ chatbot for patients
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Hospital admin dashboard
│   │   │   ├── Landing.jsx         # Clerk unlock screen
│   │   │   ├── PatientPortal.jsx   # Patient feedback submission
│   │   │   └── RoleSelection.jsx   # Role selection page
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Main app router
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── server/                          # Node.js Backend
│   ├── models/
│   │   ├── Feedback.js             # Feedback schema
│   │   └── Patient.js              # Patient schema
│   ├── routes/
│   │   ├── admin.js                # Admin routes
│   │   ├── auth.js                 # Auth routes
│   │   └── feedback.js             # Feedback routes
│   ├── server.js                   # Express server
│   ├── package.json
│   └── .env
│
└── nlp_service/                     # Python NLP Microservice
    ├── app.py                       # Flask API
    └── requirements.txt             # Python dependencies
```
