import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
export const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Supabase features (auth, saving) are disabled when env vars are missing
export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// No-op fallbacks so the app works without Supabase credentials
const noOp = () => Promise.resolve({ data: null, error: null });
const noOpAuth = {
  signInWithPassword: noOp,
  signUp: noOp,
  signOut: noOp,
  getUser: () => Promise.resolve({ data: { user: null } }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

const sbAuth = supabase ? supabase.auth : noOpAuth;

export const auth = {
  signIn: (email, password) => sbAuth.signInWithPassword({ email, password }),
  signUp: (email, password) => sbAuth.signUp({ email, password }),
  signOut: () => sbAuth.signOut(),
  getUser: () => sbAuth.getUser(),
  onAuthChange: (callback) => sbAuth.onAuthStateChange(callback),
};

export const quizzes = {
  save: (userId, title, questions) =>
    supabase ? supabase.from('quizzes').insert({ user_id: userId, title, questions }).select() : noOp(),

  getUserQuizzes: (userId) =>
    supabase ? supabase.from('quizzes').select('*').eq('user_id', userId).order('created_at', { ascending: false }) : noOp(),

  getUserAttempts: (userId) =>
    supabase ? supabase.from('attempts').select('*').eq('user_id', userId) : noOp(),

  saveAttempt: (userId, quizId, score) =>
    supabase ? supabase.from('attempts').insert({ user_id: userId, quiz_id: quizId, score }) : noOp(),

  delete: async (userId, quizId) => {
    if (!supabase) return noOp();
    await supabase.from('attempts').delete().eq('quiz_id', quizId);
    return supabase.from('quizzes').delete().eq('id', quizId).eq('user_id', userId);
  },
};
