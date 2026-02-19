import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './Hooks/useAuth';
import { quizzes } from './services/supabase';
import NavBar from './components/NavBar/NavBar';
import HomePage from './components/HomePage/HomePage';
import QuizPage from './components/QuizPage/QuizPage';
import ResultPage from './components/ResultsPage/ResultsPage';
import Toast from './components/Toast/Toast';

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

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

  const goToQuiz = async (generatedQuiz) => {
    setQuizData(generatedQuiz);
    setUserAnswers([]);
    navigate('/quiz');

    if (user) {
      try {
        const title = `Quiz - ${new Date().toLocaleDateString()}`;
        const { data } = await quizzes.save(user.id, title, generatedQuiz);
        if (data?.[0]) {
          setCurrentQuizId(data[0].id);
          showToast('Quiz saved!');
        }
      } catch (error) {
        // Quiz save failed silently — user can still take the quiz
      }
    }
  };

  const goToResults = async (answers) => {
    setUserAnswers(answers);
    navigate('/results');

    if (user && currentQuizId) {
      try {
        const score = answers.reduce((total, userAnswer, index) => {
          return userAnswer === quizData[index].correctAnswerIndex ? total + 1 : total;
        }, 0);
        await quizzes.saveAttempt(user.id, currentQuizId, score);
        showToast('Score saved!');
      } catch (error) {
        // Attempt save failed silently — results still display
      }
    }
  };

  const restartQuiz = () => {
    navigate('/quiz');
  };

  const goToHome = () => {
    setCurrentQuizId(null);
    navigate('/');
  };

  return (
    <>
      <NavBar user={user} />
      <div className="App">
        <header className="App-header">
          <h1>Quizle</h1>
          {user && <p>Welcome back, {user.email.split('@')[0]}!</p>}
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage onQuizGenerated={goToQuiz} user={user} />} />
            <Route
              path="/quiz"
              element={
                quizData.length > 0
                  ? <QuizPage quizData={quizData} onComplete={goToResults} />
                  : <Navigate to="/" replace />
              }
            />
            <Route
              path="/results"
              element={
                userAnswers.length > 0
                  ? <ResultPage
                      quizData={quizData}
                      userAnswers={userAnswers}
                      onRestart={restartQuiz}
                      onNewQuiz={goToHome}
                      user={user}
                    />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
