import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [totalSaving, setTotalSaving] = useState(() => parseFloat(localStorage.getItem('totalSaving')) || 0);
  const [unclaimedSaving, setUnclaimedSaving] = useState(() => parseFloat(localStorage.getItem('unclaimedSaving')) || 0);
  const [allUnclaimed, setAllUnclaimed] = useState(() => localStorage.getItem('allUnclaimed') === 'true');

  useEffect(() => {
    localStorage.setItem('username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('totalSaving', totalSaving.toString());
  }, [totalSaving]);

  useEffect(() => {
    localStorage.setItem('unclaimedSaving', unclaimedSaving.toString());
  }, [unclaimedSaving]);

  useEffect(() => {
    localStorage.setItem('allUnclaimed', allUnclaimed.toString());
  }, [allUnclaimed]);

  return (
    <GlobalStateContext.Provider value={{ username, setUsername, totalSaving, setTotalSaving, unclaimedSaving, setUnclaimedSaving, allUnclaimed, setAllUnclaimed }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
