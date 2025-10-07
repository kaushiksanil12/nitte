import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by fetching user stats
          const response = await axios.get('http://localhost:5000/api/progress/stats');
          setUser({ 
            token,
            stats: response.data,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user stats after login
      const statsResponse = await axios.get('http://localhost:5000/api/progress/stats');
      setUser({ 
        id: userId, 
        email,
        token,
        stats: statsResponse.data,
        isAuthenticated: true
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password
      });
      
      const { token, userId } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Initialize user stats after registration
      const statsResponse = await axios.get('http://localhost:5000/api/progress/stats');
      setUser({ 
        id: userId, 
        email,
        token,
        stats: statsResponse.data,
        isAuthenticated: true
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}