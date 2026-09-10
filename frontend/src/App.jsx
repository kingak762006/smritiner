import React, { useState } from 'react';
import Header from './components/Header';
import DisclaimerBadge from './components/DisclaimerBadge';
import ElderlyHome from './pages/ElderlyHome';
import CaregiverDashboard from './pages/CaregiverDashboard';
import ResearchEvaluation from './pages/ResearchEvaluation';

// 5 Functional Cognitive Games
import MemoryMatchGame from './games/MemoryMatchGame';
import SequenceRecallGame from './games/SequenceRecallGame';
import PatternRecognizeGame from './games/PatternRecognizeGame';
import AttentionFocusGame from './games/AttentionFocusGame';
import DailyRoutineGame from './games/DailyRoutineGame';

export default function App() {
  const [currentRole, setCurrentRole] = useState('elderly'); // 'elderly', 'caregiver', 'research'
  const [activeGame, setActiveGame] = useState(null); // null or game ID

  const handleSelectGame = (gameId) => {
    setActiveGame(gameId);
  };

  const handleBackHome = () => {
    setActiveGame(null);
  };

  const renderContent = () => {
    if (currentRole === 'caregiver') {
      return <CaregiverDashboard userId="NER-PAT-4821" />;
    }

    if (currentRole === 'research') {
      return <ResearchEvaluation />;
    }

    // Elderly user role
    if (activeGame === 'memory_matching') {
      return <MemoryMatchGame onBack={handleBackHome} userId="NER-PAT-4821" currentDifficulty={2} />;
    }
    if (activeGame === 'sequence_recall') {
      return <SequenceRecallGame onBack={handleBackHome} userId="NER-PAT-4821" currentDifficulty={2} />;
    }
    if (activeGame === 'pattern_recognition') {
      return <PatternRecognizeGame onBack={handleBackHome} userId="NER-PAT-4821" currentDifficulty={2} />;
    }
    if (activeGame === 'attention_concentration') {
      return <AttentionFocusGame onBack={handleBackHome} userId="NER-PAT-4821" currentDifficulty={2} />;
    }
    if (activeGame === 'daily_routine') {
      return <DailyRoutineGame onBack={handleBackHome} userId="NER-PAT-4821" currentDifficulty={2} />;
    }

    return <ElderlyHome onSelectGame={handleSelectGame} userId="NER-PAT-4821" />;
  };

  return (
    <div className="app-layout">
      <DisclaimerBadge />
      <Header
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          setActiveGame(null);
        }}
        onHomeClick={() => {
          setCurrentRole('elderly');
          setActiveGame(null);
        }}
      />
      <main className="main-content" id="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
