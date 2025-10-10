import React, { createContext, useState, useContext } from 'react';

const LabAuthContext = createContext(null);

/**
 * Custom provider for Lab staff authentication.
 * Uses a separate state to prevent mixing lab and ED sessions.
 */
export const LabAuthProvider = ({ children }) => {
  const [isLabAuthenticated, setIsLabAuthenticated] = useState(false);

  return (
    <LabAuthContext.Provider value={{ isLabAuthenticated, setIsLabAuthenticated }}>
      {children}
    </LabAuthContext.Provider>
  );
};

export const useLabAuth = () => {
  return useContext(LabAuthContext);
};
