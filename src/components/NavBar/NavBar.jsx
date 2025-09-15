import React, { useState } from 'react';
import { useAuth } from '../../Hooks/useAuth';
import './NavBar.css';

// Navigation bar component with authentication
// Handles sign in, sign up, and sign out
const NavBar = ({ user }) => {
  const { signIn, signUp, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle authentication form submission
  // This function manages both sign in and sign up based on the isSignUp state
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // The await is for waiting the response from the signIn or signUp function 
    // This is defined in the useAuth hook
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };
// The sign out function
  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <nav className="nav-bar">
        <a href="/" className="nav-logo">
          <span>Quizle</span>
        </a>
        
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email.split('@')[0]}</span>
              <button className="sign-out-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button 
              className="sign-in-btn" 
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{isSignUp ? 'Create Account' : 'Sign In'}</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            
            <p>
              {isSignUp ? 'Have an account?' : 'Need an account?'}{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            
            <button className="close-btn" onClick={() => setShowAuthModal(false)}>
              x
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;