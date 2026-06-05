import json
import pickle
from pathlib import Path
from flask import Flask, jsonify, request
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
JSON_MODEL_PATH = BASE_DIR / "model" / "career_model.json"
PICKLE_MODEL_PATHS = [
    BASE_DIR / "career_model.pkl",
    BASE_DIR.parent / "career_model.pkl",
]

app = Flask(__name__)

MODEL = None
PICKLE_MODEL = None
PICKLE_ARTIFACT = None
MODEL_LOAD_ERROR = None

for model_path in PICKLE_MODEL_PATHS:
    if model_path.exists():
        try:
            with model_path.open("rb") as file:
                loaded = pickle.load(file)
                if isinstance(loaded, dict) and "model" in loaded:
                    PICKLE_ARTIFACT = loaded
                    PICKLE_MODEL = loaded["model"]
                else:
                    PICKLE_MODEL = loaded
            break
        except Exception as error:
            MODEL_LOAD_ERROR = str(error)

if PICKLE_MODEL is None and JSON_MODEL_PATH.exists():
    try:
        MODEL = json.loads(JSON_MODEL_PATH.read_text(encoding="utf-8"))
    except Exception as error:
        MODEL_LOAD_ERROR = str(error)

SKILL_TAXONOMY = {
    "Software Developer": {"javascript", "python", "react", "node", "mongodb", "sql", "git", "api", "html", "css"},
    "Data Analyst": {"python", "sql", "excel", "statistics", "power bi", "tableau", "pandas", "analytics", "dashboard"},
    "UX Designer": {"figma", "wireframe", "prototype", "research", "accessibility", "design", "usability", "journey"},
    "Digital Marketing Specialist": {"seo", "content", "campaign", "analytics", "copywriting", "social media", "ads", "branding"},
    "Career Counselor": {"counseling", "mentoring", "psychology", "guidance", "assessment", "communication", "training"},
    "Business Analyst": {"requirements", "excel", "sql", "stakeholder", "process", "documentation", "agile", "analysis"},
    "Healthcare Professional": {"biology", "patient", "clinical", "healthcare", "medical", "anatomy", "care", "ethics"},
    "Creative Media Designer": {"photoshop", "illustrator", "animation", "video", "visual", "branding", "typography", "design"},
    "Research Associate": {"research", "statistics", "paper", "experiment", "methodology", "python", "writing", "analysis"},
}

STOP_WORDS = {
    "and", "the", "for", "with", "from", "that", "this", "have", "has", "are", "was", "were", "you", "your",
    "work", "project", "projects", "using", "into", "about", "also", "will", "can", "our", "their", "team",
}

TREE_FEATURES = [
    "Math_Score",
    "Physics_Score",
    "Chemistry_Score",
    "Biology_Score",
    "English_Score",
    "GPA",
    "Coding_Skill",
    "Problem_Solving",
    "Data_Analysis",
    "Web_Development",
    "AI_Interest",
    "Communication",
    "Leadership",
    "Teamwork",
    "Public_Speaking",
    "Creativity",
    "Analytical_Thinking",
    "Attention_To_Detail",
    "Stress_Handling",
    "Research_Interest",
    "Social_Service_Interest",
]


def guidance_for(career):
    if career in SKILL_TAXONOMY:
        skills = sorted(SKILL_TAXONOMY[career])[:4]
    else:
        skills = ["communication", "problem solving", "portfolio projects", "digital literacy"]
    return {
        "educationPath": ["Build fundamentals", "Complete guided projects", "Create portfolio proof"],
        "skillsToBuild": [skill.title() for skill in skills],
    }


def scale_score(scores, key, fallback=3):
    return float(scores.get(key, fallback))


def direct_feature_input(features):
    return pd.DataFrame([[float(features.get(feature, 0)) for feature in TREE_FEATURES]], columns=TREE_FEATURES)


def mapped_feature_input(scores):
    technical = scale_score(scores, "technical")
    analytical = scale_score(scores, "analytical")
    creativity = scale_score(scores, "creativity")
    communication = scale_score(scores, "communication")
    social = scale_score(scores, "social")
    business = scale_score(scores, "business")
    health = scale_score(scores, "health_interest")
    problem = scale_score(scores, "problem_solving")
    academic = scale_score(scores, "academic_score")

    def mark(value):
        return round(value * 20, 2)

    def ten(value):
        return round(value * 2, 2)

    values = [
        mark(analytical),
        mark(technical),
        mark(health),
        mark(health),
        mark(communication),
        round(academic * 2, 2),
        ten(technical),
        ten(problem),
        ten(analytical),
        ten(technical),
        ten(technical),
        ten(communication),
        ten(business),
        ten(social),
        ten(communication),
        ten(creativity),
        ten(analytical),
        ten(problem),
        ten(problem),
        ten(analytical),
        ten(social),
    ]
    return pd.DataFrame([values], columns=TREE_FEATURES)


def distance(a, b):
    if MODEL is None:
        return 0
    total = 0
    for index, feature in enumerate(MODEL["features"]):
        total += (float(a.get(feature, 3)) - float(b[index])) ** 2
    return total ** 0.5


def class_names():
    if PICKLE_ARTIFACT and "encoder" in PICKLE_ARTIFACT:
        return list(PICKLE_ARTIFACT["encoder"].classes_)
    return list(getattr(PICKLE_MODEL, "classes_", []))


def predict(payload):
    if PICKLE_MODEL is not None:
        try:
            input_row = direct_feature_input(payload["features"]) if "features" in payload else mapped_feature_input(payload.get("scores", {}))
            raw_prediction = PICKLE_MODEL.predict(input_row)[0]
            names = class_names()
            if PICKLE_ARTIFACT and "encoder" in PICKLE_ARTIFACT:
                career = str(PICKLE_ARTIFACT["encoder"].inverse_transform([raw_prediction])[0])
            elif isinstance(raw_prediction, int) and names:
                career = str(names[raw_prediction])
            else:
                career = str(raw_prediction)

            alternatives = []
            confidence = 0.82
            if hasattr(PICKLE_MODEL, "predict_proba"):
                probabilities = PICKLE_MODEL.predict_proba(input_row)[0]
                ranked = sorted(enumerate(probabilities), key=lambda item: item[1], reverse=True)
                alternatives = [
                    {"career": str(names[index]), "score": round(float(probability), 4)}
                    for index, probability in ranked[1:4]
                    if index < len(names)
                ]
                confidence = round(float(ranked[0][1]), 4)
        except Exception as error:
            return {
                "career": "Software Developer",
                "confidence": 0.55,
                "educationPath": ["Fix ML model input mapping", "Retrain model", "Run prediction again"],
                "skillsToBuild": ["Problem Solving", "Python", "Model Debugging"],
                "explanation": f"Random Forest model loaded, but prediction failed: {error}",
                "alternatives": [],
                "model": "random_forest_error",
                "dataset": "training.csv",
            }
        guidance = guidance_for(career)
        score_source = payload.get("features") or payload.get("scores", {})
        top_features = sorted(score_source.items(), key=lambda item: float(item[1]), reverse=True)[:3]
        strengths = ", ".join(feature.replace("_", " ") for feature, _ in top_features)
        return {
            "career": career,
            "confidence": confidence,
            "educationPath": guidance["educationPath"],
            "skillsToBuild": guidance["skillsToBuild"],
            "explanation": f"Random Forest predicted this career from your strongest profile signals: {strengths}.",
            "alternatives": alternatives,
            "model": "random_forest",
            "dataset": "training.csv",
        }

    if MODEL is None:
        return {
            "career": "Software Developer",
            "confidence": 0.6,
            "educationPath": ["Build fundamentals", "Complete projects", "Prepare portfolio"],
            "skillsToBuild": ["Problem Solving", "Communication", "Digital Literacy"],
            "explanation": f"No usable ML model file was found, so a safe fallback recommendation was used. {MODEL_LOAD_ERROR or ''}".strip(),
            "alternatives": [],
            "model": "fallback",
            "dataset": "none",
        }

    neighbors = []
    for sample in MODEL.get("samples", []):
        dist = distance(scores, sample["vector"])
        neighbors.append({**sample, "distance": dist, "similarity": 1 / (1 + dist)})

    neighbors.sort(key=lambda item: item["distance"])
    nearest = neighbors[: MODEL.get("k", 9)]
    votes = {}
    for neighbor in nearest:
        votes[neighbor["career"]] = votes.get(neighbor["career"], 0) + neighbor["similarity"]

    ranked = sorted(votes.items(), key=lambda item: item[1], reverse=True)
    career, vote_score = ranked[0]
    details = MODEL["careers"].get(career, {})
    confidence = round(min(0.96, 0.45 + (vote_score / max(1, len(nearest)))), 2)

    top_features = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:3]
    strengths = ", ".join(feature.replace("_", " ") for feature, _ in top_features)

    return {
        "career": career,
        "confidence": confidence,
        "educationPath": details["educationPath"],
        "skillsToBuild": details["skillsToBuild"],
        "explanation": f"KNN found similar successful profiles with strengths in {strengths}.",
        "alternatives": [
            {"career": alt, "score": round(score, 2)}
            for alt, score in ranked[1:4]
        ],
        "model": MODEL.get("modelType", "knn"),
        "dataset": MODEL.get("source", "unknown"),
        "similarProfiles": [
            {"career": item["career"], "similarity": round(item["similarity"], 2)}
            for item in nearest[:5]
        ],
    }


def normalize_text(text):
    lowered = text.lower()
    for char in ",.;:()[]{}|/\\+-_":
        lowered = lowered.replace(char, " ")
    return " ".join(lowered.split())


def extract_keywords(text):
    words = [word for word in normalize_text(text).split() if len(word) > 3 and word not in STOP_WORDS]
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return [word for word, _count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:12]]


def analyze_resume_text(resume_text):
    text = normalize_text(resume_text)
    extracted = sorted({skill for skills in SKILL_TAXONOMY.values() for skill in skills if skill in text})
    keywords = extract_keywords(resume_text)

    ranked = []
    for career, required_skills in SKILL_TAXONOMY.items():
        matched = required_skills.intersection(extracted)
        score = len(matched) / len(required_skills)
        ranked.append((career, score, sorted(required_skills - matched)))

    ranked.sort(key=lambda item: item[1], reverse=True)
    matched_career, score, missing = ranked[0]
    readable_skills = [skill.title() if len(skill) <= 3 else skill for skill in extracted]

    return {
        "matchedCareer": matched_career,
        "matchScore": round(max(0.35, min(0.96, score + 0.35)), 2),
        "extractedSkills": readable_skills[:16],
        "keywords": keywords,
        "missingSkills": [skill.title() if len(skill) <= 3 else skill for skill in missing[:6]],
        "summary": f"Resume language currently aligns most closely with {matched_career}. Add evidence for the missing skills to improve fit.",
        "alternatives": [{"career": career, "score": round(value, 2)} for career, value, _missing in ranked[1:4]],
    }


@app.get("/health")
def health():
    if PICKLE_MODEL is not None:
        return jsonify({
            "status": "ok",
            "model": PICKLE_ARTIFACT.get("model_type", "random_forest") if PICKLE_ARTIFACT else "pickle_model",
            "dataset": PICKLE_ARTIFACT.get("dataset", "training.csv") if PICKLE_ARTIFACT else "training.csv",
            "accuracy": PICKLE_ARTIFACT.get("accuracy") if PICKLE_ARTIFACT else None,
            "features": TREE_FEATURES,
            "modelClasses": len(class_names())
        })

    if MODEL is None:
        return jsonify({
            "status": "degraded",
            "model": "fallback",
            "dataset": "none",
            "modelClasses": 0,
            "error": MODEL_LOAD_ERROR
        })

    return jsonify({
        "status": "ok",
        "model": MODEL.get("modelType", "knn"),
        "dataset": MODEL.get("source", "unknown"),
        "profiles": MODEL.get("rows", len(MODEL.get("samples", []))),
        "modelClasses": len(MODEL["careers"])
    })


@app.post("/predict")
def recommend():
    body = request.get_json(silent=True) or {}
    return jsonify(predict(body))


@app.post("/analyze-resume")
def analyze_resume():
    body = request.get_json(silent=True) or {}
    resume_text = body.get("resumeText", "")
    if len(resume_text.strip()) < 80:
        return jsonify({"message": "Resume text is too short for NLP analysis"}), 400
    return jsonify(analyze_resume_text(resume_text))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
