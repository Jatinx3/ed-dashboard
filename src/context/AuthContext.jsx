import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read initial state from localStorage, default to false if not found
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const storedValue = localStorage.getItem('edIsAuthenticated');
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (error) {
      console.error("Failed to read 'edIsAuthenticated' from localStorage", error);
      return false;
    }
  });

  // Use useEffect to save the state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('edIsAuthenticated', JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error("Failed to write 'edIsAuthenticated' to localStorage", error);
    }
  }, [isAuthenticated]);

  const value = { isAuthenticated, setIsAuthenticated };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};