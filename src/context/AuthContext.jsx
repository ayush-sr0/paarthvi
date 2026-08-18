import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.success) {
      localStorage.setItem('parthvi_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, phone) => {
    const data = await api.register(name, email, password, phone);
    if (data.success) {
      localStorage.setItem('parthvi_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('parthvi_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
