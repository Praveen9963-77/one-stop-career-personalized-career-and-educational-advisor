from pathlib import Path
import pickle

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "training.csv"
MODEL_PATH = BASE_DIR / "career_model.pkl"

FEATURE_COLUMNS = [
    "Math_Interest",
    "Physics_Interest",
    "Chemistry_Interest",
    "Biology_Interest",
    "English_Interest",
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


def train():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLUMNS].apply(pd.to_numeric, errors="coerce").fillna(0)
    y = df["Recommended_Career"]

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    stratify = y_encoded if pd.Series(y_encoded).value_counts().min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=2,
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
        "model_type": "random_forest",
        "dataset": "training.csv",
    }

    with MODEL_PATH.open("wb") as file:
        pickle.dump(artifact, file)

    print(f"Random Forest model trained successfully")
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_, zero_division=0))
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
