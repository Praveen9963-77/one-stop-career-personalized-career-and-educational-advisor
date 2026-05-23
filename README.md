# One Stop Personalized Career and Educational Advisor

A MERN stack career guidance platform with login, interactive aptitude/interest tests, NLP resume analysis, MongoDB result storage, and a Python ML recommendation service.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB
- ML service: Python + Flask, trained from `ml-service/career_training_data.csv`

## Run Locally

1. Install dependencies:

```bash
npm run install:all
```

2. Train the ML model:

```bash
npm run train:model
```

3. Start MongoDB locally, then copy the backend env file:

```bash
cp server/.env.example server/.env
```

4. Start all services:

```bash
npm run dev
```

Services:

- React app: `http://localhost:5173`
- Express API: `http://localhost:5001`
- Python ML/NLP API: `http://localhost:8000`

## Core Flow

1. User registers or logs in.
2. User completes a personalized test covering interests, skills, academics, and work style.
3. Express sends the score profile to the Python ML service.
4. Users can paste resume text for NLP-based skill extraction and career-fit analysis.
5. Recommendations, test profiles, and resume analyses are stored in MongoDB.
6. The dashboard shows latest result, recommendation history, and education path suggestions.

## ML Dataset

The ML service now trains a KNN recommender. If `ml-service/roo_data.csv` exists, it uses that larger existing public career-prediction dataset. Otherwise it falls back to the small demo CSV so the app still runs.

KNN behavior: it compares a new user's profile to historical student profiles and recommends the career label followed by the nearest similar profiles.
