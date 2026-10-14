import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sb_auth_token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const loginCustomer = async (email, password) => {
    const res = await api.post('/auth/customer/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('sb_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/customer/register', data);
    if (res.data.success) {
      localStorage.setItem('sb_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('sb_auth_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('sb_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer',
        loginCustomer,
        registerCustomer,
        loginAdmin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
