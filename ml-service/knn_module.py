"""
KNN-based Career Recommendation Module
Uses user features (marks, skills, interests) for similarity matching
Normalizes data before applying KNN algorithm
"""

import numpy as np
import pandas as pd
from pathlib import Path
from collections import Counter
from sklearn.preprocessing import MinMaxScaler

BASE_DIR = Path(__file__).resolve().parent
TRAINING_DATA_PATH = BASE_DIR / "training.csv"

FEATURE_COLUMNS = [
    "Math_Interest", "Physics_Interest", "Chemistry_Interest", "Biology_Interest", "English_Interest", "GPA",
    "Coding_Skill", "Problem_Solving", "Data_Analysis", "Web_Development", "AI_Interest",
    "Communication", "Leadership", "Teamwork", "Public_Speaking", "Creativity", "Analytical_Thinking",
    "Attention_To_Detail", "Stress_Handling", "Research_Interest", "Social_Service_Interest",
    "Cybersecurity_Interest", "Blockchain_Interest", "Cloud_Computing", "DevOps_Interest",
    "Mobile_Development", "UI_UX_Design", "Product_Management", "Digital_Marketing",
    "Testing_QA", "Database_Management",
]

CAREER_ROADMAPS = {
    "ML Engineer": {
        "roadmap": ["Python", "Mathematics (Linear Algebra)", "Machine Learning basics", "Data preprocessing", "Projects", "Tools: Scikit-learn, Pandas"],
        "skills": ["Python", "Machine Learning", "Statistics", "Data Analysis"]
    },
    "Data Scientist": {
        "roadmap": ["Statistics & Probability", "Python + SQL", "Data Visualization", "Machine Learning basics", "Projects"],
        "skills": ["Python", "SQL", "Statistics", "Data Visualization"]
    },
    "Web Developer": {
        "roadmap": ["HTML, CSS, JavaScript", "Frontend frameworks (React)", "Backend basics", "Full stack projects"],
        "skills": ["JavaScript", "React", "HTML/CSS", "Backend Development"]
    },
    "Software Engineer": {
        "roadmap": ["Data Structures", "System Design", "Code Quality", "Version Control", "Testing", "Deployment"],
        "skills": ["Problem Solving", "System Design", "Testing", "Git"]
    },
    "Full Stack Developer": {
        "roadmap": ["Frontend (HTML/CSS/JS)", "Backend Framework", "Database Design", "Full stack projects", "DevOps basics"],
        "skills": ["JavaScript", "Backend", "Database", "DevOps"]
    },
    "AI Engineer": {
        "roadmap": ["Python & ML basics", "Deep Learning", "NLP or Computer Vision", "Model Deployment", "Production pipelines"],
        "skills": ["Python", "Deep Learning", "AI/ML", "Deployment"]
    },
    "Cybersecurity Analyst": {
        "roadmap": ["Networking fundamentals", "Linux & scripting", "Web security", "Threat monitoring", "Security audits"],
        "skills": ["Networking", "Linux", "Security", "Incident Response"]
    },
    "Blockchain Developer": {
        "roadmap": ["Blockchain fundamentals", "Solidity basics", "Smart contracts", "Web3 frontend", "Security audits"],
        "skills": ["Solidity", "Smart Contracts", "Blockchain", "Security"]
    },
    "Cloud Engineer": {
        "roadmap": ["Linux & networking", "Cloud platforms (AWS/Azure)", "Docker containerization", "Monitoring", "Infrastructure projects"],
        "skills": ["AWS", "Docker", "Kubernetes", "Monitoring"]
    },
    "DevOps Engineer": {
        "roadmap": ["Linux & Git", "CI/CD pipelines", "Docker containers", "Kubernetes", "Infrastructure automation"],
        "skills": ["CI/CD", "Docker", "Kubernetes", "Automation"]
    },
    "Mobile App Developer": {
        "roadmap": ["Mobile UI basics", "State management", "API integration", "Platform specifics", "App deployment"],
        "skills": ["React Native", "Mobile UI", "API Integration", "App Development"]
    },
    "UI/UX Designer": {
        "roadmap": ["Design fundamentals", "User research", "Wireframing & prototyping", "Design systems", "Usability testing"],
        "skills": ["Figma", "User Research", "Design Systems", "Prototyping"]
    },
    "Product Manager": {
        "roadmap": ["Product thinking", "User research", "Analytics", "Roadmapping", "Stakeholder management"],
        "skills": ["Analytics", "Communication", "Leadership", "User Research"]
    },
    "Business Analyst": {
        "roadmap": ["Business processes", "Requirements analysis", "SQL & reporting", "Stakeholder communication", "Case studies"],
        "skills": ["Requirements Analysis", "SQL", "Communication", "Process Mapping"]
    },
    "Digital Marketing Specialist": {
        "roadmap": ["Marketing fundamentals", "SEO & content", "Analytics & metrics", "Campaign management", "Portfolio"],
        "skills": ["SEO", "Analytics", "Content Marketing", "Social Media"]
    },
    "QA Automation Engineer": {
        "roadmap": ["Testing fundamentals", "Automation frameworks", "API testing", "CI/CD integration", "Test strategies"],
        "skills": ["Testing", "Automation", "Code", "Quality Assurance"]
    },
}


class KNNRecommender:
    """
    K-Nearest Neighbors based career recommender.
    Normalizes user features and finds similar profiles based on feature similarity.
    """
    
    def __init__(self, k=5, data_path=TRAINING_DATA_PATH):
        """
        Initialize KNN recommender.
        
        Args:
            k: Number of nearest neighbors (default: 5)
            data_path: Path to training data CSV
        """
        self.k = k
        self.data_path = data_path
        self.training_data = None
        self.scaler = MinMaxScaler()
        self.normalized_features = None
        self.load_data()
        
    def load_data(self):
        """Load and prepare training data."""
        try:
            if not self.data_path.exists():
                raise FileNotFoundError(f"Training data not found: {self.data_path}")
            
            self.training_data = pd.read_csv(self.data_path)
            
            # Extract features and careers
            self.X = self.training_data[FEATURE_COLUMNS].fillna(0).values
            self.y = self.training_data.get("Career", self.training_data.get("Target", None))
            
            if self.y is None:
                raise ValueError("No Career or Target column in training data")
            
            # Normalize features
            self.normalized_features = self.scaler.fit_transform(self.X)
            
        except Exception as e:
            print(f"Error loading data: {e}")
            self.training_data = None
            self.normalized_features = None
    
    def euclidean_distance(self, user_features, training_features):
        """Calculate Euclidean distance between user and training features."""
        return np.sqrt(np.sum((user_features - training_features) ** 2, axis=1))
    
    def normalize_user_features(self, user_features_dict):
        """
        Normalize user input features using the scaler.
        
        Args:
            user_features_dict: Dictionary with feature names and values
            
        Returns:
            Normalized feature array
        """
        # Create feature vector in correct order
        feature_vector = np.array([
            user_features_dict.get(col, 0) for col in FEATURE_COLUMNS
        ], dtype=float).reshape(1, -1)
        
        # Normalize using the fitted scaler
        normalized = self.scaler.transform(feature_vector)
        return normalized[0]
    
    def get_nearest_neighbors(self, user_features_dict, k=None):
        """
        Find K nearest neighbors for the user.
        
        Args:
            user_features_dict: Dictionary with user's feature values
            k: Number of neighbors (uses self.k if not specified)
            
        Returns:
            List of (index, distance, career) tuples
        """
        if self.normalized_features is None:
            return []
        
        if k is None:
            k = self.k
        
        # Normalize user features
        user_normalized = self.normalize_user_features(user_features_dict)
        
        # Calculate distances
        distances = self.euclidean_distance(
            user_normalized,
            self.normalized_features
        )
        
        # Get K nearest neighbors
        nearest_indices = np.argsort(distances)[:k]
        neighbors = [
            (idx, distances[idx], self.y.iloc[idx] if hasattr(self.y, 'iloc') else self.y[idx])
            for idx in nearest_indices
        ]
        
        return neighbors
    
    def get_knn_recommendations(self, user_features_dict, num_recommendations=3):
        """
        Get top career recommendations based on KNN voting.
        
        Args:
            user_features_dict: Dictionary with user's feature values
            num_recommendations: Number of top recommendations to return
            
        Returns:
            List of {career, score, confidence, similar_profile_count}
        """
        if self.normalized_features is None:
            return []
        
        neighbors = self.get_nearest_neighbors(user_features_dict)
        
        if not neighbors:
            return []
        
        # Vote based on neighbor careers
        career_votes = Counter()
        career_distances = {}
        
        for idx, distance, career in neighbors:
            career_votes[career] += 1
            if career not in career_distances:
                career_distances[career] = []
            career_distances[career].append(distance)
        
        # Calculate confidence scores (inverse of average distance)
        recommendations = []
        for career, vote_count in career_votes.most_common(num_recommendations):
            avg_distance = np.mean(career_distances[career])
            # Convert distance to confidence (0-1 range)
            # Closer distance (smaller value) = higher confidence
            confidence = 1 / (1 + avg_distance) if avg_distance != 0 else 1.0
            
            # Normalize confidence based on votes
            vote_weight = vote_count / len(neighbors)
            final_confidence = (confidence * 0.7) + (vote_weight * 0.3)
            
            recommendations.append({
                "career": career,
                "score": round(final_confidence, 3),
                "confidence": round(final_confidence * 100, 1),
                "similar_profile_count": vote_count
            })
        
        # Normalize scores to sum to 100%
        if recommendations:
            total_score = sum(r["score"] for r in recommendations)
            for r in recommendations:
                r["confidence"] = round((r["score"] / total_score) * 100, 1)
        
        return recommendations
    
    def get_similar_profiles(self, user_features_dict, num_profiles=3):
        """
        Get anonymous similar profiles (no names, just careers).
        
        Args:
            user_features_dict: Dictionary with user's feature values
            num_profiles: Number of profiles to return
            
        Returns:
            List of {profile_id, career} (anonymous)
        """
        neighbors = self.get_nearest_neighbors(user_features_dict, k=num_profiles)
        
        profiles = []
        for idx, (neighbor_idx, distance, career) in enumerate(neighbors):
            profiles.append({
                "profile_id": f"Profile {idx + 1}",
                "career": career,
                "similarity_score": round((1 / (1 + distance)) * 100, 1)
            })
        
        return profiles
    
    def get_roadmap(self, career):
        """
        Get predefined roadmap for a career.
        
        Args:
            career: Career name
            
        Returns:
            Roadmap data or None if not found
        """
        return CAREER_ROADMAPS.get(career, None)
    
    def get_all_roadmaps(self, recommendations):
        """
        Get roadmaps for top recommendations.
        
        Args:
            recommendations: List of recommendation dictionaries
            
        Returns:
            Dictionary mapping careers to roadmaps
        """
        roadmaps = {}
        for rec in recommendations:
            career = rec.get("career")
            roadmap_data = self.get_roadmap(career)
            if roadmap_data:
                roadmaps[career] = roadmap_data["roadmap"]
        
        return roadmaps


def recommend_with_knn(user_features_dict, k=5, num_recommendations=3):
    """
    Convenience function to get KNN recommendations.
    
    Args:
        user_features_dict: Dictionary with user features
        k: Number of neighbors
        num_recommendations: Number of top recommendations
        
    Returns:
        {
            "knn_recommendations": [...],
            "similar_profiles": [...],
            "roadmaps": {...}
        }
    """
    try:
        recommender = KNNRecommender(k=k)
        
        recommendations = recommender.get_knn_recommendations(
            user_features_dict,
            num_recommendations=num_recommendations
        )
        
        similar_profiles = recommender.get_similar_profiles(
            user_features_dict,
            num_profiles=min(3, k)
        )
        
        roadmaps = recommender.get_all_roadmaps(recommendations)
        
        return {
            "knn_recommendations": recommendations,
            "similar_profiles": similar_profiles,
            "roadmaps": roadmaps,
            "status": "success"
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "knn_recommendations": [],
            "similar_profiles": [],
            "roadmaps": {}
        }
