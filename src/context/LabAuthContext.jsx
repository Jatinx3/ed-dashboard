import React, { createContext, useState, useContext, useEffect } from 'react';

const LabAuthContext = createContext(null);

export const LabAuthProvider = ({ children }) => {
  // Read initial state from localStorage, default to false if not found
  const [isLabAuthenticated, setIsLabAuthenticated] = useState(() => {
    try {
      const storedValue = localStorage.getItem('labIsAuthenticated');
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (error) {
      console.error("Failed to read 'labIsAuthenticated' from localStorage", error);
      return false;
    }
  });

  // Use useEffect to save the state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('labIsAuthenticated', JSON.stringify(isLabAuthenticated));
    } catch (error) {
      console.error("Failed to write 'labIsAuthenticated' to localStorage", error);
    }
  }, [isLabAuthenticated]);

  const value = { isLabAuthenticated, setIsLabAuthenticated };

  return (
    <LabAuthContext.Provider value={value}>
      {children}
    </LabAuthContext.Provider>
  );
};

export const useLabAuth = () => {
  return useContext(LabAuthContext);
};