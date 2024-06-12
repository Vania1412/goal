import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsGoalPage from './pages/DetailsGoalPage';
import AchievedGoalsPage from './pages/AchievedGoalsPage';
import SuggestionPage from './pages/SuggestionPage';
import BadgesPage from './pages/BadgesPage';
import NotFoundPage from './pages/NotFoundPage';
import InterestedPage from './pages/InterestedPage';
import SignupPage from './pages/SignUpPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';

import { GlobalStateProvider } from './GlobalStateContext';

function App() {
  return (
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/details-goal/:goalTitle" element={<DetailsGoalPage />} />
          <Route path="/achieved" element={<AchievedGoalsPage />} />
          <Route path="/suggestion" element={<SuggestionPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/interested" element={<InterestedPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route */}
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;
