import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsGoalPage from './pages/DetailsGoalPage';
import AchievedGoalsPage from './pages/AchievedGoalsPage';
import SuggestionPage from './pages/SuggestionPage';
import BadgesPage from './pages/BadgesPage';
import NotFoundPage from './pages/NotFoundPage';
import InterestedPage from './pages/InterestedPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/details-goal/:goalTitle" element={<DetailsGoalPage />} />
        <Route path="/achieved" element={<AchievedGoalsPage />} />
        <Route path="/suggestion" element={<SuggestionPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/interested" element={<InterestedPage />} />
        <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route */}
      </Routes>
    </Router>
  );
}

export default App;
