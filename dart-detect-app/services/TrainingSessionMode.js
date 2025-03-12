// Training Session Mode logic

// Initialise training session state
export const InitialiseSession = () => ({
    currentRound: 1,
    roundScores: [],
    currentRoundScore: 0,
});

// Add current round score and move to nect round
export const AddRoundScore = (session, score) => {
    const newRoundScores = [...session.roundScores, score];
    return {
        ...session,
        currentRound: session.currentRound + 1,
        roundScores: newRoundScores,
        currentRoundScore: 0,
    };
};  

// Calculate stats for round scores
export const CalculateStats = (roundScores) => {
  const totalScore = roundScores.reduce((sum, score) => sum + score, 0);
  const averageScore = roundScores.length > 0 ? (totalScore / roundScores.length).toFixed(2) : 0;
  const highestScore = roundScores.length > 0 ? Math.max(...roundScores) : 0;
  const lowestScore = roundScores.length > 0 ? Math.min(...roundScores) : 0

  return {
    totalScore,
    averageScore,
    highestScore,
    lowestScore,
    };
};




