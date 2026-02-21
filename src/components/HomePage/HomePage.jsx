import React, { useState } from 'react';
import { generateQuiz } from '../../services/geminiService';
import './HomePage.css';

function HomePage({ onQuizGenerated }) {
  const [facts, setFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facts.trim()) {
      setError('Please enter some facts to generate a quiz');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const generatedQuiz = await generateQuiz(facts);
      onQuizGenerated(generatedQuiz);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <h2>Create Your Custom Quiz</h2>
      <p>Enter facts or information below, and we'll generate quiz questions for you!</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <textarea
          rows="10"
          maxLength={5000}
          placeholder="Enter facts here (e.g., 'The Earth orbits the Sun. Water freezes at 0°C. The human body has 206 bones.')"
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          disabled={isLoading}
        />
        {facts.length > 4000 && (
          <p className="char-count">{facts.length}/5000 characters</p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" style={{ display: 'inline-block', verticalAlign: 'middle' }}></span>
              Generating Quiz...
            </>
          ) : (
            'Create Quiz'
          )}
        </button>
      </form>
    </div>
  );
}

export default HomePage;
