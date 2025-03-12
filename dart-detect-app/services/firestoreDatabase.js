import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Import Firestore

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

