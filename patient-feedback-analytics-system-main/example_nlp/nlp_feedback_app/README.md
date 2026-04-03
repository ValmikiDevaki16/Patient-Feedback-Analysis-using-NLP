# HOW TO EXECUTE THE PROJECT

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables (optional)

This project uses local CSV storage by default. No environment variables are required to run it locally.

If you plan to enable Clerk authentication later, add your Clerk keys to the `.env` file as shown below (optional):

```
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. Run the Flask Server

```bash
python app.py
```

The application will start on `http://localhost:5000`

## Accessing the Application

- **Home Page:** http://localhost:5000/
- **Patient Feedback (Chatbot):** http://localhost:5000/chatbot
- **Analytics Dashboard:** http://localhost:5000/dashboard

## Usage

1. **Submit Feedback**: Go to the chatbot page, select a department, and submit patient feedback
2. **View Analytics**: Access the dashboard to view real-time analytics, charts, and recommendations
3. **Authentication**: Dashboard runs in public/local mode by default. Clerk authentication is optional — if you enable it, follow the optional instructions in `setup_instructions.txt`.

## Troubleshooting

- If you get "Module not found" errors, ensure all dependencies are installed: `pip install -r requirements.txt`
- If the server doesn't start, check that port 5000 is not in use by another application
  -- Feedback storage: feedback records are persisted to `data/feedback.csv`. If you want to migrate to MongoDB or another DB later, modify `storage/csv_store.py` and `app.py` accordingly.
