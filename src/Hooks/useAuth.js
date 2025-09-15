import { useState, useEffect } from 'react';
import { auth } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    // This checks if a user is already logged in when the app loads
    // If so, it sets the user state and loading to false
    auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    // This sets up a listener for authentication state changes (sign in, sign out)
    // When the auth state changes, it updates the user state accordingly
    const { data: { subscription } } = auth.onAuthChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // this cleans up the subscription when your component unmounts
    return () => subscription.unsubscribe();
    // added empty dependency array to run only once on mount
  }, []);
  // Sign in function
  // This function calls the signIn method from the auth object in supabase.js
  // It returns the user data and any error that occurs during sign in
  const signIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password);
    return { user: data?.user, error };
  };
  // Sign up function
  // Similar to signIn, this function calls the signUp method
  // It returns the user data and any error that occurs during sign up
  const signUp = async (email, password) => {
    const { data, error } = await auth.signUp(email, password);
    return { user: data?.user, error };
  };
  // Sign out function
  // This function calls the signOut method from the auth object
  // The reason you don't need to handle user state here is because the auth state change listener will take care of it
  const signOut = () => auth.signOut();
  
  // now you return the user, loading state, and auth functions from the hook
  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
};