import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load User Profile on boot
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Demo Login Quick-Bypass for Instant Testing
  const demoLogin = (role) => {
    const demoUser = {
      _id: `demo_${role.toLowerCase()}_123`,
      name: `Demo ${role}`,
      email: `demo.${role.toLowerCase()}@eventhub.com`,
      role: role,
      phone: '+1 555-0199',
      organization: role === 'Organizer' ? 'Grand Events Tech' : '',
    };
    const mockToken = `demo_jwt_token_${role.toLowerCase()}`;
    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser(demoUser);
    return demoUser;
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/register', userData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Forgot Password handler
  const forgotPassword = async (email) => {
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      return { success: true, message: data.message, resetToken: data.resetToken, resetUrl: data.resetUrl };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset.';
      return { success: false, message: msg };
    }
  };

  // Reset Password handler
  const resetPassword = async (resetToken, password) => {
    try {
      const { data } = await API.put(`/auth/reset-password/${resetToken}`, { password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        demoLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        isAuthenticated: !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
