import { ArrowRight, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../api";
const defaultAnswers = {
  technical: 3,
  analytical: 3,
  creativity: 3,
  communication: 3,
  social: 3,
  business: 3,
  health_interest: 3,
  arts_interest: 3,
  problem_solving: 3,
  academic_score: 3,
};
function shuffleArray(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function TestPanel({ onSaved, onNavigate }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(defaultAnswers);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/tests/questions").then((data) => setQuestions(shuffleArray(data.questions)));
  }, []);

  const question = questions[active];
  const progress = questions.length ? Math.round(((active + 1) / questions.length) * 100) : 0;
  const selectedAnswer = question ? answers[question.id] : undefined;

  async function submit() {
    setLoading(true);
    const data = await api("/tests/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    onSaved(data.result);
    setLoading(false);
  }

  if (!question) {
    return <section className="panel">Loading test...</section>;
  }

  return (
    <section className="test-surface">
      <div className="test-header">
        <div>
          <p className="eyebrow">Aptitude test</p>
          <h2>{question.text}</h2>
        </div>
        <strong>{progress}%</strong>
      </div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      {question.options ? (
        <div className="option-row">
          {question.options.map((option) => (
            <button
              key={option}
              className={selectedAnswer === option ? "selected" : ""}
              onClick={() => setAnswers({ ...answers, [question.id]: option })}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="rating-row">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={answers[question.id] === value ? "selected" : ""}
                onClick={() => setAnswers({ ...answers, [question.id]: value })}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="scale-labels">
            <span>Strongly disagree</span>
            <span>Strongly agree</span>
          </div>
        </>
      )}
      <div className="actions">
        <button disabled={active === 0} onClick={() => setActive(active - 1)}>Back</button>
        {active < questions.length - 1 ? (
          <button className="primary" onClick={() => setActive(active + 1)} disabled={!selectedAnswer}>Next <ArrowRight size={18} /></button>
        ) : (
          <button className="primary" onClick={submit} disabled={loading || !selectedAnswer}>{loading ? "Analyzing..." : "Get recommendation"} <Sparkles size={18} /></button>
        )}
      </div>
      <button className="secondary" onClick={() => onNavigate?.("guidance")}>Go to Guidance Path</button>
    </section>
  );
}
export default TestPanel;

