import { GraduationCap, Compass, Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { api } from "../api";

function ResultPanel({ result, onNavigate }) {
  const [knnRecommendations, setKnnRecommendations] = useState([]);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("prediction");
  const [showFeedback, setShowFeedback] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (result && result.recommendation) {
      fetchKNNRecommendations();
      fetchAnalytics();
    }
  }, [result]);

  const fetchKNNRecommendations = async () => {
    setLoading(true);
    try {
      // Extract user features from the result
      const userFeatures = result.scores || {};
      
      try {
        const data = await api("/advisor/knn-recommend", {
          method: "POST",
          body: JSON.stringify({
            features: userFeatures,
            k: 5,
            num_recommendations: 3
          })
        });
        setKnnRecommendations(data.knn_recommendations || []);
        setSimilarProfiles(data.similar_profiles || []);
        setRoadmaps(data.roadmaps || {});
      } catch (err) {
        console.warn("KNN recommendation failed:", err.message || err);
      }
    } catch (error) {
      console.error("Error fetching KNN recommendations:", error);
      // Recommendations will remain empty, UI will show fallback message
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const career = result.recommendation?.career;
      if (!career) return;

      try {
        const data = await api(`/advisor/analytics/${encodeURIComponent(career)}`);
        setAnalytics(data.analytics);
      } catch (err) {
        console.warn("Analytics fetch failed:", err.message || err);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (!result) {
    return (
      <section className="empty-state">
        <GraduationCap size={42} />
        <h2>No test result yet</h2>
        <p>Complete the profile test to generate your first career and education recommendation.</p>
      </section>
    );
  }

  const recommendation = result.recommendation;
  const career = recommendation.career;

  return (
    <section className="result-grid">
      {/* Tab Navigation */}
      <div className="panel tabs-nav" style={{ gridColumn: "1 / -1" }}>
        <button 
          className={activeTab === "prediction" ? "active" : ""}
          onClick={() => setActiveTab("prediction")}
        >
          <Compass size={18} /> Prediction
        </button>
        <button 
          className={activeTab === "knn" ? "active" : ""}
          onClick={() => setActiveTab("knn")}
        >
          <Users size={18} /> KNN Insights
        </button>
        <button 
          className={activeTab === "roadmap" ? "active" : ""}
          onClick={() => setActiveTab("roadmap")}
        >
          <BookOpen size={18} /> Roadmaps
        </button>
        <button 
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <TrendingUp size={18} /> Analytics
        </button>
      </div>

      {/* Original Prediction Tab */}
      {activeTab === "prediction" && (
        <>
          <div className="recommendation">
            <p className="eyebrow">Recommended career (Model Prediction)</p>
            <h2>{career}</h2>
            <p>{recommendation.explanation}</p>
            <div className="confidence">
              <span>Confidence</span>
              <strong>{Math.round((recommendation.confidence || 0) * 100)}%</strong>
            </div>
          </div>
          <div className="panel">
            <h3>Next steps</h3>
            <p>Open the guidance path to view the detailed learning flow, free YouTube videos, and certification recommendations.</p>
            <button className="primary" onClick={() => onNavigate?.("guidance")}>Open guidance path</button>
          </div>
          <div className="panel score-panel">
            <h3>Profile signals</h3>
            <div className="chips">
              {recommendation.skillsToBuild?.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </>
      )}

      {/* KNN Recommendations Tab */}
      {activeTab === "knn" && (
        <>
          <div className="recommendation" style={{ gridColumn: "1 / -1" }}>
            <p className="eyebrow">KNN-Based Recommendations (Enhanced Layer)</p>
            <h3>Top 3–4 Career Matches</h3>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : knnRecommendations.length > 0 ? (
              <div className="knn-recommendations">
                {knnRecommendations.map((rec, idx) => (
                  <div key={idx} className="knn-item" style={{ marginBottom: "12px", padding: "12px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", fontSize: "16px" }}>{rec.career}</span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#4CAF50" }}>
                        {rec.confidence}% confidence
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      Based on {rec.similar_profile_count} similar profiles
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No KNN recommendations available.</p>
            )}
          </div>

          {/* Similar Profiles */}
          {similarProfiles.length > 0 && (
            <div className="panel" style={{ gridColumn: "1 / -1" }}>
              <h3><Users size={18} /> Similar Profiles (Anonymous)</h3>
              <div style={{ marginTop: "12px" }}>
                {similarProfiles.map((profile, idx) => (
                  <div key={idx} style={{ padding: "10px", marginBottom: "8px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
                    <p style={{ fontWeight: "600" }}>{profile.profile_id} → {profile.career}</p>
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      Similarity: {profile.similarity_score}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel" style={{ gridColumn: "1 / -1" }}>
            <button className="primary" onClick={() => setShowFeedback(true)} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <MessageSquare size={18} /> Provide Feedback
            </button>
          </div>
        </>
      )}

      {/* Roadmaps Tab */}
      {activeTab === "roadmap" && (
        <>
          <div className="recommendation" style={{ gridColumn: "1 / -1" }}>
            <p className="eyebrow">Career Roadmaps</p>
            {Object.keys(roadmaps).length > 0 ? (
              Object.entries(roadmaps).map(([careerName, roadmapSteps], idx) => (
                <div key={idx} style={{ marginBottom: "24px" }}>
                  <h3 style={{ marginBottom: "12px", color: "#1976d2" }}>{careerName}</h3>
                  <ol style={{ paddingLeft: "20px" }}>
                    {roadmapSteps.map((step, stepIdx) => (
                      <li key={stepIdx} style={{ marginBottom: "8px", lineHeight: "1.6" }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))
            ) : (
              <p>No roadmaps available.</p>
            )}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          <div className="recommendation" style={{ gridColumn: "1 / -1" }}>
            <p className="eyebrow">Career Success Analytics</p>
            {analytics ? (
              <div>
                <h3 style={{ marginBottom: "16px" }}>{analytics.career}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#e8f5e9", borderRadius: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Success Rate</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#4CAF50" }}>
                      {analytics.successRate}%
                    </p>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: "#e3f2fd", borderRadius: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Avg Time Taken</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1976d2" }}>
                      {analytics.averageTimeTakenMonths || 0} months
                    </p>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: "#f3e5f5", borderRadius: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Total Users</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#7b1fa2" }}>
                      {analytics.totalUsers}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <h4>Outcome Distribution:</h4>
                  <ul style={{ marginTop: "8px", fontSize: "14px" }}>
                    <li>Got Job: {analytics.jobCount}</li>
                    <li>Got Internship: {analytics.internshipCount}</li>
                    <li>Still Learning: {analytics.stillLearningCount}</li>
                    <li>Not Interested: {analytics.notInterestedCount}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p>No analytics data available yet.</p>
            )}
          </div>
        </>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal 
          career={career} 
          recommendations={knnRecommendations}
          onClose={() => setShowFeedback(false)}
          result={result}
        />
      )}

      <style>{`
        .tabs-nav {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 12px;
          border-bottom: 2px solid #e0e0e0;
        }
        .tabs-nav button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          gap: 6px;
          align-items: center;
          color: #666;
          white-space: nowrap;
          transition: all 0.3s;
        }
        .tabs-nav button.active {
          color: #1976d2;
          border-bottom: 2px solid #1976d2;
          font-weight: 600;
        }
        .knn-recommendations {
          display: flex;
          flex-direction: column;
        }
        .knn-item {
          transition: all 0.2s;
        }
        .knn-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </section>
  );
}

// Feedback Modal Component
function FeedbackModal({ career, recommendations, onClose, result }) {
  const [outcome, setOutcome] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) {
      alert("Please select an outcome");
      return;
    }

    setLoading(true);
    try {
      try {
        await api("/advisor/feedback", {
          method: "POST",
          body: JSON.stringify({
            testResultId: result?._id,
            userFeatures: result?.scores || {},
            recommendedCareers: recommendations,
            selectedCareer: career,
            outcome,
            roleTitle,
            timeTakenMonths: timeTaken ? parseInt(timeTaken) : null,
            feedbackNotes: notes
          })
        });
        alert("Thank you! Your feedback has been saved.");
        onClose();
      } catch (err) {
        console.error("Error submitting feedback:", err);
        alert(err.message || "Error submitting feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h3>Career Recommendation Feedback</h3>
        <p style={{ color: "#666", marginTop: "8px" }}>Help us improve by sharing your experience with the {career} recommendation.</p>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            What happened after this recommendation?
          </label>
          {["Got Job", "Got Internship", "Still Learning", "Not Interested"].map(opt => (
            <label key={opt} style={{ display: "flex", alignItems: "center", marginBottom: "8px", cursor: "pointer" }}>
              <input 
                type="radio" 
                name="outcome" 
                value={opt}
                checked={outcome === opt}
                onChange={(e) => setOutcome(e.target.value)}
                style={{ marginRight: "8px" }}
              />
              {opt}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
            Role title (optional)
          </label>
          <input 
            type="text"
            placeholder="e.g., Data Science Intern"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
            Time taken to reach this outcome (months, optional)
          </label>
          <input 
            type="number"
            placeholder="e.g., 4"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600" }}>
            Additional notes (optional)
          </label>
          <textarea 
            placeholder="Share your experience..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              minHeight: "80px",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#1976d2",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;


