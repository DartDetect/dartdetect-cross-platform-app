import { doc, setDoc, collection, addDoc, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firestore
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Function to create a user profile in Firestore
export const createUserProfile = async (uid, name, nationality) => {
  try {
    
    await setDoc(doc(db, "users", uid), {
      name: name,
      nationality: nationality,
      averageTrainingScore: 0,
      averagePlayScore: 0,
      totalGamesPlayed: 0,
    });
    console.log("User profile created successfully!");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }

};

// Function to save a training session result in Firestore
export const saveTrainingSession = async (uid, sessionData) => {
  try {
    // Add a new document to TrainingSessions collection
    await addDoc(collection(db, "trainingSessions"), {
      uid: uid,                                // Associate session with the user
      rounds: sessionData.rounds,              // Total rounds played 
      scores: sessionData.scores,              // Scores for each round
      totalScore: sessionData.totalScore,      // Sum of all rounds
      averageScore: sessionData.averageScore,  // Average score per round
      highestScore: sessionData.highestScore,  // Highest score achieved in a round
      lowestScore: sessionData.lowestScore,    // Lowest score achieved in a round
      timestamp: new Date(),               
    });
    console.log("Training session saved successfully!");
  } catch (error) {
    console.error("Error saving training session:", error);
  }
};

// Function to save a play mode session result in Firestore
export const savePlaySession = async (uid, sessionData) => {
  try {
    await addDoc(collection(db, "playSessions"), {
      uid: uid,                                   // User ID
      name: sessionData.name,                     // Player name
      totalScore: sessionData.totalScore,         // Total score achieved
      averageScore: sessionData.averageScore,     // Average score per dart
      rounds: sessionData.rounds,                 // Number of rounds played
      scoreHistory: sessionData.scoreHistory,     // score and image info
      timestamp: new Date(),
    });
    console.log("Play session saved successfully!");
  } catch (error) {
    console.error("Error saving play session:", error);
  }
};

// Fetch play sessions for current user
export const fetchPlaySessions = async () => {
  const auth = getAuth();
  const uid = auth.currentUser.uid;

  const q = query(collection(db, "playSessions"), where("uid", "==", uid));
  const snapshot = await getDocs(q);

  // Return sessions with document id
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
};

