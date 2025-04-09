import { InitialiseSession } from "../TrainingSessionMode";

export const handleTrainingReset = (setSession, setSessionStarted, setProcessedDarts, setImage) => {
  setSession(InitialiseSession());
  setSessionStarted(false);
  setProcessedDarts([]);
  setImage(null);
};
