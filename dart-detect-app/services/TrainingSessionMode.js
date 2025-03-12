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



