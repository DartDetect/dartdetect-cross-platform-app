// services/reset.js

export const handleReset = (setPlayers, setCurrentPlayerIndex) => {
    // Reset player scores and history
    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.map((player) => ({
        ...player,
        score: 501, // Reset the score to 501
        history: [], // Reset the history for all players
      }));
      return updatedPlayers;
    });
    
    // Reset the current player to Player 1
    setCurrentPlayerIndex(0); // Start with player 1 after reset
  };
  