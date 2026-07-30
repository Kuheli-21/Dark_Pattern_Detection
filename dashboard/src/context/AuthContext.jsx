import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, signupApi, logoutApi, refreshTokenApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial silent refresh on app boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshTokenApi();
        if (res.accessToken) {
          // If user info is returned or default user
          setUser(res.user || { email: 'analyst@darkpattern.ai', name: 'Cyber Analyst' });
        }
      } catch (err) {
        // Silent refresh failed (no valid refresh cookie), user needs to login
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginApi(email, password);
      setUser(data.user || { email, name: 'Cyber Analyst' });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (email, password) => {
    setError(null);
    try {
      const data = await signupApi(email, password);
      setUser(data.user || { email, name: 'Cyber Analyst' });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
