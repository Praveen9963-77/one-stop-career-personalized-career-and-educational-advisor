import { GraduationCap } from "lucide-react";
import React from "react";
function ResultPanel({ result }) {
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
  const scores = Object.fromEntries(Object.entries(result.scores || {}));

  return (
    <section className="result-grid">
      <div className="recommendation">
        <p className="eyebrow">Recommended path</p>
        <h2>{recommendation.career}</h2>
        <p>{recommendation.explanation}</p>
        <div className="confidence">
          <span>Confidence</span>
          <strong>{Math.round((recommendation.confidence || 0) * 100)}%</strong>
        </div>
      </div>
      <div className="panel">
        <h3>Education Path</h3>
        {recommendation.educationPath?.map((item) => <p className="path-item" key={item}>{item}</p>)}
      </div>
      <div className="panel">
        <h3>Skills To Build</h3>
        <div className="chips">
          {recommendation.skillsToBuild?.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>
      <div className="panel score-panel">
        <h3>Profile Signals</h3>
        {Object.entries(scores).map(([name, value]) => (
          <div className="score" key={name}>
            <span>{name.replace("_", " ")}</span>
            <div><span style={{ width: `${Number(value) * 20}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default ResultPanel;

