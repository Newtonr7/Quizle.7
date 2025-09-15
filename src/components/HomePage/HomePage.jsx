import React, { useState } from 'react';
import { generateQuiz } from '../../services/geminiService';
import './HomePage.css';
// Home page component
function HomePage({ onQuizGenerated }) {
  const [facts, setFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

// Handle form submission to generate quiz
// You use an async function because you are calling an API
// I added error handling to show a message if the quiz generation fails
  const handleSubmit = async (e) => {
    e.preventDefault();
    // The trim method removes whitespace from both ends of a string
    if (!facts.trim()) {
      setError('Please enter some facts to generate a quiz');
      return;
    }
    // You set loading to true when the quiz generation starts
    setIsLoading(true);
    setError(null);

    // Using a try-catch block to handle potential errors from the API call
    // I call the generateQuiz function from the geminiService
    // Then you pass the generated quiz to the onQuizGenerated prop function
    try {
      const generatedQuiz = await generateQuiz(facts);
      onQuizGenerated(generatedQuiz);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', err);
      // you put finally to ensure loading is set to false after the operation
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
          placeholder="Enter facts here (e.g., 'The Earth orbits the Sun. Water freezes at 0°C. The human body has 206 bones.')"
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating Quiz...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}

export default HomePage;