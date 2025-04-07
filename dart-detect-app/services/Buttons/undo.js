// services/Buttons/undo.js

export const handleUndo = (currentPlayerIndex, setPlayers) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      const current = updatedPlayers[currentPlayerIndex];
      current.history.pop(); // Remove the last round from the history
      const totalScored = current.history.reduce((sum, dartObj) => sum + dartObj.score, 0);
      current.score = Math.max(501 - totalScored, 0); // Update score
      return updatedPlayers;
    });
  };
  