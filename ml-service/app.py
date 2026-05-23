import json
from pathlib import Path
from flask import Flask, jsonify, request

try:
    from train_model import MODEL_PATH, train
except ImportError:
    from .train_model import MODEL_PATH, train

app = Flask(__name__)

if not MODEL_PATH.exists():
    train()

MODEL = json.loads(MODEL_PATH.read_text(encoding="utf-8"))

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


def distance(a, b):
    total = 0
    for index, feature in enumerate(MODEL["features"]):
        total += (float(a.get(feature, 3)) - float(b[index])) ** 2
    return total ** 0.5


def predict(scores):
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
    scores = body.get("scores", {})
    return jsonify(predict(scores))


@app.post("/analyze-resume")
def analyze_resume():
    body = request.get_json(silent=True) or {}
    resume_text = body.get("resumeText", "")
    if len(resume_text.strip()) < 80:
        return jsonify({"message": "Resume text is too short for NLP analysis"}), 400
    return jsonify(analyze_resume_text(resume_text))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
