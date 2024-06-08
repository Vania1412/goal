import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [totalSaving, setTotalSaving] = useState(0);
  const [unclaimedSaving, setUnclaimedSaving] = useState(0);
  const [allUnclaimed, setAllUnclaimed] = useState(false);  

  return (
    <GlobalStateContext.Provider value={{
      totalSaving,
      setTotalSaving,
      unclaimedSaving,
      setUnclaimedSaving,
      allUnclaimed,
      setAllUnclaimed
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};
