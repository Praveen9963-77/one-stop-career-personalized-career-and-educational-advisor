from pathlib import Path
import pickle

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "training.csv"
MODEL_PATH = BASE_DIR / "career_model.pkl"

FEATURE_COLUMNS = [
    "Math_Interest", "Physics_Interest", "Chemistry_Interest", "Biology_Interest", "English_Interest", "GPA",
    "Coding_Skill", "Problem_Solving", "Data_Analysis", "Web_Development", "AI_Interest",
    "Communication", "Leadership", "Teamwork", "Public_Speaking", "Creativity", "Analytical_Thinking",
    "Attention_To_Detail", "Stress_Handling", "Research_Interest", "Social_Service_Interest",
    "Cybersecurity_Interest", "Blockchain_Interest", "Cloud_Computing", "DevOps_Interest",
    "Mobile_Development", "UI_UX_Design", "Product_Management", "Digital_Marketing",
    "Testing_QA", "Database_Management",
]

ROLE_PROTOTYPES = {
    "Software Engineer": {
        "Coding_Skill": 9,
        "Problem_Solving": 9,
        "Database_Management": 7,
        "Web_Development": 7,
        "AI_Interest": 5,
        "Research_Interest": 4,
        "Data_Analysis": 6,
        "Cloud_Computing": 5,
    },
    "Full Stack Developer": {"Web_Development": 10, "Coding_Skill": 9, "Database_Management": 8, "Cloud_Computing": 6},
    "Data Scientist": {"Data_Analysis": 10, "AI_Interest": 8, "Math_Interest": 8, "Analytical_Thinking": 9, "Research_Interest": 7},
    "AI Engineer": {
        "AI_Interest": 10,
        "Data_Analysis": 9,
        "Research_Interest": 9,
        "Math_Interest": 8,
        "Coding_Skill": 8,
        "Web_Development": 4,
        "Cloud_Computing": 5,
    },
    "Cybersecurity Analyst": {"Cybersecurity_Interest": 10, "Attention_To_Detail": 9, "Problem_Solving": 8, "Stress_Handling": 8},
    "Blockchain Developer": {"Blockchain_Interest": 10, "Coding_Skill": 8, "Problem_Solving": 8, "Database_Management": 6},
    "Cloud Engineer": {"Cloud_Computing": 10, "DevOps_Interest": 8, "Coding_Skill": 6, "Problem_Solving": 7},
    "DevOps Engineer": {"DevOps_Interest": 10, "Cloud_Computing": 9, "Testing_QA": 7, "Stress_Handling": 8, "Coding_Skill": 7},
    "Mobile App Developer": {"Mobile_Development": 10, "Coding_Skill": 8, "UI_UX_Design": 6, "Creativity": 6},
    "UI/UX Designer": {"UI_UX_Design": 10, "Creativity": 9, "Communication": 7, "Research_Interest": 7},
    "Product Manager": {"Product_Management": 10, "Leadership": 9, "Communication": 9, "Data_Analysis": 7, "Teamwork": 8},
    "Business Analyst": {"Communication": 9, "Data_Analysis": 8, "Product_Management": 7, "Analytical_Thinking": 8},
    "Digital Marketing Specialist": {"Digital_Marketing": 10, "Creativity": 8, "Communication": 8, "Data_Analysis": 6},
    "QA Automation Engineer": {"Testing_QA": 10, "Attention_To_Detail": 9, "Coding_Skill": 7, "Problem_Solving": 7},
    "Database Administrator": {"Database_Management": 10, "Attention_To_Detail": 8, "Stress_Handling": 7, "Data_Analysis": 7},
    "Research Scientist": {"Research_Interest": 10, "Math_Interest": 8, "Analytical_Thinking": 9, "AI_Interest": 7},
    "Healthcare Professional": {"Biology_Interest": 10, "Chemistry_Interest": 8, "Communication": 8, "Social_Service_Interest": 8},
}


def generate_training_data(rows_per_role=90, random_state=42):
    rng = np.random.default_rng(random_state)
    rows = []
    for career, boosts in ROLE_PROTOTYPES.items():
        for _ in range(rows_per_role):
            row = {feature: float(rng.integers(2, 7)) for feature in FEATURE_COLUMNS}
            row["GPA"] = float(np.round(rng.uniform(6.0, 9.5), 1))
            for feature, target in boosts.items():
                row[feature] = float(np.clip(rng.normal(target, 1.0), 1, 10))
            row["Recommended_Career"] = career
            rows.append(row)
    df = pd.DataFrame(rows)
    df.to_csv(DATA_PATH, index=False)
    return df


def train():
    df = generate_training_data()
    X = df[FEATURE_COLUMNS].apply(pd.to_numeric, errors="coerce").fillna(0)
    encoder = LabelEncoder()
    y = encoder.fit_transform(df["Recommended_Career"])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    artifact = {
        "model": model,
        "encoder": encoder,
        "features": FEATURE_COLUMNS,
        "accuracy": accuracy,
        "model_type": "random_forest_balanced_market_roles",
        "dataset": "generated_balanced_market_roles_training.csv",
        "roles": sorted(ROLE_PROTOTYPES),
    }
    with MODEL_PATH.open("wb") as file:
        pickle.dump(artifact, file)
    print("Random Forest model trained successfully")
    print(f"Rows: {len(df)}")
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_, zero_division=0))
    print(f"Saved dataset to {DATA_PATH}")
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
