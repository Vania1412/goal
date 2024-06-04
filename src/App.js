import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import DetailsGoalPage from './pages/DetailsGoalPage.js';
import AchievedGoalsPage from './pages/AchievedGoalsPage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/details-goal" element={<DetailsGoalPage />} />
        <Route path="/details-goal/:goalTitle" element={<DetailsGoalPage />} />
        <Route path="/achieved" element={<AchievedGoalsPage />} />
      </Routes>
    </Router>
  );
}

export default App;