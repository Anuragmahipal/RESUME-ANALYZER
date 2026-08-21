import React, { useState } from "react";

const Quiz = ({ quiz = [] }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex, option) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  const calculateScore = () => {
    let score = 0;

    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
      }
    });

    return score;
  };

  return (
    <div className="quiz-wrapper">
      {quiz.map((q, i) => (
        <div key={i} className="quiz-card">
          <h3>{q.question}</h3>

          <div className="options">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(i, opt)}
                className={`quiz-option ${
                  answers[i] === opt ? "selected" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button className="button primary-button" onClick={() => setSubmitted(true)}>
          Submit Quiz
        </button>
      ) : (
        <h2>
          Your Score: {calculateScore()} / {quiz.length}
        </h2>
      )}
    </div>
  );
};

export default Quiz;