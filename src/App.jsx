import React, { useState } from 'react';
import './App.css';
import { useAuth } from './Hooks/useAuth';
import { quizzes } from './services/supabase';
import NavBar from './components/NavBar/NavBar';
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import ResultPage from './components/ResultsPage/ResultsPage';

// Main application component
// This component manages the overall state and navigation of the app
// It uses the useAuth hook for authentication and conditionally renders pages based on user actions
function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  
  // Loading state
  // This shows a loading spinner while the authentication state is being determined
  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation handlers to switch between pages
  // These functions update the currentPage state to render different components
  const goToQuiz = async (generatedQuiz) => {
    setQuizData(generatedQuiz);
    setCurrentPage('quiz');
    // The setUserAnswers([]) resets the answers when starting a new quiz
    setUserAnswers([]);

    // Auto-save quiz for authenticated users
    // This attempts to save the generated quiz to the database if the user is logged in
    if (user) {
      try {
        // The toLocaleDateString() is used to create a readable date for the quiz title
        // This helps users identify their quizzes later
        const title = `Quiz - ${new Date().toLocaleDateString()}`;
        // Save the quiz and store the returned quiz ID
        const { data } = await quizzes.save(user.id, title, generatedQuiz);
        // If the quiz was saved successfully, set the currentQuizId state to the new quiz's ID
        if (data?.[0]) setCurrentQuizId(data[0].id);
      } catch (error) {
        console.log('Quiz not saved - continuing anyway');
      }
    }
  };
  // This function handles moving to the results page after the quiz is completed
  const goToResults = async (answers) => {
    setUserAnswers(answers);
    setCurrentPage('results');

    // Auto-save attempt for authenticated users
    // This is why you need the currentQuizId state
    if (user && currentQuizId) { 
      // try catch to handle any errors during the save attempt
      try {
        const score = answers.reduce((total, userAnswer, index) => {
          return userAnswer === quizData[index].correctAnswerIndex ? total + 1 : total;
          // You put 0 as the initial value for total
        }, 0);
        // Now await for the saveAttempt function to complete
        await quizzes.saveAttempt(user.id, currentQuizId, score);
      } catch (error) {
        console.log('Attempt not saved - continuing anyway');
      }
    }
  };
  // This function handles going back to the home page to start a new quiz
  const goToHome = () => {
    setCurrentPage('home');
    setCurrentQuizId(null);
  };
// The main return statement renders the NavBar and the current page component
// It passes necessary props to each page component for functionality
  return (
    <>
      <NavBar user={user} />
      <div className="App">
        <header className="App-header">
          <h1>Quizle</h1>
          {user && <p>Welcome back, {user.email.split('@')[0]}!</p>}
        </header>
        <main>
          {currentPage === 'home' && <HomePage onQuizGenerated={goToQuiz} user={user} />}
          {currentPage === 'quiz' && <QuizPage quizData={quizData} onComplete={goToResults} />}
          {currentPage === 'results' && (
            <ResultPage 
              quizData={quizData} 
              userAnswers={userAnswers} 
              onRestart={goToQuiz} 
              onNewQuiz={goToHome}
              user={user}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;