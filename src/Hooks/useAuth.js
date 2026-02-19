import { useState, useEffect } from 'react';
import { auth } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = auth.onAuthChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password);
    return { user: data?.user, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await auth.signUp(email, password);
    return { user: data?.user, error };
  };

  const signOut = () => auth.signOut();

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
};
