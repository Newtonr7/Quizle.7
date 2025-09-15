import { createClient } from '@supabase/supabase-js';
// Initialize Supabase client
// This uses environment variables for the Supabase URL and anon key for security
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
// This creates a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication functions
// These functions wrap Supabase auth methods for signing in, signing up, signing out, and managing auth state
export const auth = {
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  // The callback is used to handle auth state changes (like sign in/out)
  // This is useful for keeping your app's UI in sync with the user's auth status
  onAuthChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// Quiz database functions
// These functions handle saving quizzes, retrieving user quizzes, and saving quiz attempts
export const quizzes = {
  save: (userId, title, questions) => 
    supabase.from('quizzes').insert({ user_id: userId, title, questions }),
  
  getUserQuizzes: (userId) => 
    supabase.from('quizzes').select('*').eq('user_id', userId),
  
  saveAttempt: (userId, quizId, score) => 
    supabase.from('attempts').insert({ user_id: userId, quiz_id: quizId, score }),
};