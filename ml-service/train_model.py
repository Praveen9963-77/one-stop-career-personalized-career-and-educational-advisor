import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SMALL_DATA_PATH = BASE_DIR / "career_training_data.csv"
LARGE_DATA_PATH = BASE_DIR / "roo_data.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "career_model.json"

FEATURES = [
    "technical",
    "analytical",
    "creativity",
    "communication",
    "social",
    "business",
    "health_interest",
    "arts_interest",
    "problem_solving",
    "academic_score",
]

TARGET_CANDIDATES = [
    "Suggested Job Role",
    "suggested_job_role",
    "career",
    "Career",
    "job_role",
    "Recommended Career",
]

CAREER_GUIDANCE = {
    "Software Developer": {
        "educationPath": ["B.Tech CSE / BCA", "Data structures and web development", "Internships and GitHub portfolio"],
        "skillsToBuild": ["JavaScript", "Python", "Databases", "System design"],
    },
    "Data Analyst": {
        "educationPath": ["B.Sc / B.Tech / BBA with analytics", "Statistics and SQL", "BI dashboards and case studies"],
        "skillsToBuild": ["Python", "SQL", "Excel", "Data visualization"],
    },
    "UX Designer": {
        "educationPath": ["Design degree or UX certification", "Human-computer interaction", "Portfolio with usability studies"],
        "skillsToBuild": ["User research", "Wireframing", "Figma", "Accessibility"],
    },
    "Digital Marketing Specialist": {
        "educationPath": ["BBA / BA / marketing certification", "SEO and campaign analytics", "Live campaign portfolio"],
        "skillsToBuild": ["SEO", "Copywriting", "Analytics", "Content strategy"],
    },
    "Career Counselor": {
        "educationPath": ["Psychology / education degree", "Counseling certification", "Supervised guidance practice"],
        "skillsToBuild": ["Active listening", "Assessment design", "Mentoring", "Ethics"],
    },
    "Business Analyst": {
        "educationPath": ["BBA / MBA / engineering plus business analytics", "Process modeling", "Industry case projects"],
        "skillsToBuild": ["Requirements analysis", "Excel", "SQL", "Stakeholder management"],
    },
    "Healthcare Professional": {
        "educationPath": ["BiPC / life sciences foundation", "Healthcare degree path", "Clinical exposure and certifications"],
        "skillsToBuild": ["Biology", "Empathy", "Documentation", "Medical ethics"],
    },
    "Creative Media Designer": {
        "educationPath": ["Fine arts / animation / media program", "Tool specialization", "Public creative portfolio"],
        "skillsToBuild": ["Visual design", "Motion graphics", "Storytelling", "Brand systems"],
    },
    "Research Associate": {
        "educationPath": ["Strong undergraduate academics", "Research methodology", "Projects, papers, or lab internships"],
        "skillsToBuild": ["Literature review", "Statistics", "Technical writing", "Experiment design"],
    },
}

KEYWORD_MAP = {
    "technical": ["program", "coding", "computer", "software", "network", "architecture", "electronics", "technical"],
    "analytical": ["algorithm", "math", "logical", "data", "analysis", "statistics", "sql"],
    "creativity": ["creative", "design", "books", "art", "writing", "reading"],
    "communication": ["communication", "public speaking", "speaking", "presentation"],
    "social": ["team", "relationship", "people", "social", "mentor"],
    "business": ["management", "business", "salary", "company", "entrepreneur"],
    "health_interest": ["biology", "medical", "health", "clinical"],
    "arts_interest": ["design", "arts", "creative", "media"],
    "problem_solving": ["logical", "hackathon", "coding", "problem", "smart"],
    "academic_score": ["percentage", "academic", "gpa", "score", "marks"],
}


def read_csv(path):
    with path.open(newline="", encoding="utf-8-sig") as file:
        return list(csv.DictReader(file))


def safe_float(value):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def detect_target(headers):
    for candidate in TARGET_CANDIDATES:
        if candidate in headers:
            return candidate
    return headers[-1]


def normalize_number(value, values):
    numeric = safe_float(value)
    if numeric is None:
        numeric = sum(values) / len(values) if values else 3.0
    if not values:
        return max(1.0, min(5.0, numeric)) / 5.0
    low = min(values)
    high = max(values)
    if math.isclose(low, high):
        return 0.5
    return (numeric - low) / (high - low)


def categorical_score(value):
    text = str(value).strip().lower()
    if text in {"yes", "high", "excellent", "strong", "smart worker", "technical"}:
        return 1.0
    if text in {"no", "low", "poor", "weak"}:
        return 0.0
    if text in {"medium", "average"}:
        return 0.5
    return min(1.0, max(0.0, (sum(ord(char) for char in text) % 100) / 100))


def derive_profile(row, columns, numeric_ranges):
    profile = {}
    for feature, keywords in KEYWORD_MAP.items():
        matched = []
        for column in columns:
            lowered = column.lower()
            if any(keyword in lowered for keyword in keywords):
                numeric_values = numeric_ranges.get(column, [])
                numeric = safe_float(row.get(column))
                matched.append(normalize_number(numeric, numeric_values) if numeric is not None else categorical_score(row.get(column)))
        profile[feature] = round((sum(matched) / len(matched)) * 4 + 1, 3) if matched else 3.0
    return profile


def guidance_for(career):
    if career in CAREER_GUIDANCE:
        return CAREER_GUIDANCE[career]

    lowered = career.lower()
    if "data" in lowered:
        return CAREER_GUIDANCE["Data Analyst"]
    if "design" in lowered or "ux" in lowered:
        return CAREER_GUIDANCE["UX Designer"]
    if "business" in lowered or "analyst" in lowered:
        return CAREER_GUIDANCE["Business Analyst"]
    if "marketing" in lowered:
        return CAREER_GUIDANCE["Digital Marketing Specialist"]
    if "health" in lowered or "medical" in lowered:
        return CAREER_GUIDANCE["Healthcare Professional"]
    if "research" in lowered:
        return CAREER_GUIDANCE["Research Associate"]
    return CAREER_GUIDANCE["Software Developer"]


def build_knn_model(rows, target_column, source):
    columns = [column for column in rows[0].keys() if column != target_column]
    numeric_ranges = {}
    for column in columns:
        values = [safe_float(row.get(column)) for row in rows]
        values = [value for value in values if value is not None]
        if values:
            numeric_ranges[column] = values

    samples = []
    label_counts = Counter()
    for row in rows:
        career = str(row.get(target_column, "")).strip()
        if not career:
            continue
        profile = derive_profile(row, columns, numeric_ranges) if source == "roo_data.csv" else {
            feature: float(row[feature]) for feature in FEATURES
        }
        samples.append({"career": career, "vector": [profile[feature] for feature in FEATURES]})
        label_counts[career] += 1

    careers = {
        career: {
            "support": count,
            **guidance_for(career),
        }
        for career, count in label_counts.items()
    }

    return {
        "modelType": "knn",
        "k": 9,
        "features": FEATURES,
        "source": source,
        "rows": len(samples),
        "careers": careers,
        "samples": samples,
        "description": "KNN recommends the career followed by the most similar historical student profiles.",
    }


def train():
    if LARGE_DATA_PATH.exists():
      rows = read_csv(LARGE_DATA_PATH)
      target_column = detect_target(list(rows[0].keys()))
      model = build_knn_model(rows, target_column, LARGE_DATA_PATH.name)
    else:
      rows = read_csv(SMALL_DATA_PATH)
      model = build_knn_model(rows, "career", SMALL_DATA_PATH.name)

    MODEL_DIR.mkdir(exist_ok=True)
    MODEL_PATH.write_text(json.dumps(model, indent=2), encoding="utf-8")
    print(
        f"Trained {model['modelType'].upper()} career model from {model['source']} "
        f"with {model['rows']} profiles and {len(model['careers'])} careers -> {MODEL_PATH}"
    )


if __name__ == "__main__":
    train()
