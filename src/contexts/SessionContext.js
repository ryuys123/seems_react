import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const showSessionExpired = () => {
    setShowSessionExpiredModal(true);
  };

  const hideSessionExpired = () => {
    setShowSessionExpiredModal(false);
  };

  const handleSessionExpiredConfirm = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <SessionContext.Provider value={{
      showSessionExpiredModal,
      showSessionExpired,
      hideSessionExpired,
      handleSessionExpiredConfirm
    }}>
      {children}
    </SessionContext.Provider>
  );
}; 