import { createContext, useContext, useState, useEffect } from 'react';

const demoUser = {
  id: 'sagar-kumar',
  name: 'Sagar Kumar',
  email: 'sagar.kumar@example.com',
  isVerified: true,
};

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('devconnect-token');
      const savedUser = localStorage.getItem('devconnect-user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('devconnect-user');
          localStorage.removeItem('devconnect-token');
        }
      } else {
        // This frontend currently uses mock services, so keep the full demo
        // experience accessible until a real authentication API is connected.
        setUser(demoUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('devconnect-user', JSON.stringify(userData));
    localStorage.setItem('devconnect-token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devconnect-user');
    localStorage.removeItem('devconnect-token');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
