import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('parthvi_token');
      if (token) {
        try {
          const data = await api.getMe();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('parthvi_token');
          }
        } catch (e) {
          localStorage.removeItem('parthvi_token');
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Listen to Supabase Auth State Changes (Google OAuth Redirects)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const { email, user_metadata } = session.user;
        if (email) {
          const syncRes = await api.syncGoogleUser(
            email,
            user_metadata?.full_name || user_metadata?.name || email.split('@')[0],
            user_metadata?.avatar_url || user_metadata?.picture
          );
          if (syncRes.success) {
            localStorage.setItem('parthvi_token', syncRes.token);
            setUser(syncRes.user);
          }
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success) {
      localStorage.setItem('parthvi_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: (import.meta.env.VITE_APP_URL || window.location.origin) + '/account',
        },
      });
      if (error) {
        if (error.message?.includes('provider is not enabled')) {
          throw new Error('Google Auth provider is not enabled in your Supabase Dashboard yet. Please toggle Google ON under Authentication -> Providers in Supabase.');
        }
        throw error;
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };


  const register = async (name, email, password, phone) => {
    const data = await api.register(name, email, password, phone);
    if (data.success) {
      localStorage.setItem('parthvi_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    localStorage.removeItem('parthvi_token');
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

