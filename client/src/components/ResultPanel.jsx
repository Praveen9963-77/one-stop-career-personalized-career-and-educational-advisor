import { GraduationCap, Compass } from "lucide-react";
import React from "react";
function ResultPanel({ result, onNavigate }) {
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

  return (
    <section className="result-grid">
      <div className="recommendation">
        <p className="eyebrow">Recommended career</p>
        <h2>{recommendation.career}</h2>
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
    </section>
  );
}
export default ResultPanel;

