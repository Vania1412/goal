import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsGoalPage from './pages/DetailsGoalPage';
import AchievedGoalsPage from './pages/AchievedGoalsPage';
import SuggestionPage from './pages/SuggestionPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import InterestedPage from './pages/InterestedPage';
import SignupPage from './pages/SignUpPage';
import LoginPage from './pages/LogInPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import ProgressBoardPage from './pages/ProgressBoardPage';

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
          <Route path="/profile/:profileUser" element={<ProfilePage />} />
          <Route path="/interested" element={<InterestedPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/log-in" element={<LoginPage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/progress-board" element={<ProgressBoardPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route */}
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;
