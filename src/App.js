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
import FollowingFollowersPage from './pages/FollowingFollowersPage';
import ProgressBoardPage from './pages/ProgressBoardPage';
import GoalAddingPage from './pages/GoalAddingPage';
import ChallengePage from './pages/ChallengePage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import { GlobalStateProvider } from './GlobalStateContext';

function App() {

  return (
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/log-in" />} />
          <Route path="/details-goal/:goalTitle" element={<DetailsGoalPage />} />
          <Route path="/achieved" element={<AchievedGoalsPage />} />
          <Route path="/suggestion" element={<SuggestionPage />} />
          <Route path="/profile/:profileUser" element={<ProfilePage />} />
          <Route path="/interested" element={<InterestedPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/log-in" element={<LoginPage />} />
          <Route path="/following-followers" element={<FollowingFollowersPage />} />
          <Route path="/progress-board" element={<ProgressBoardPage />} />
          <Route path="/goal-adding" element={<GoalAddingPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/challenge/:challengeId" element={<ChallengeDetailPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route */}
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;
