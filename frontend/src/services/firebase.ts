// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


export const addQuest = async (
  tokenId: number,
  title: string,
  walletAddress: string,
  description: string,
  reward: string
) => {
  try {
    const scoresRef = collection(db, "quests");

    const postObj = {
      tokenId: tokenId,
      participants: [],
      ownerAddress: walletAddress.toLowerCase(),
      title: title,
      description: description,
      reward: reward
    }

    await addDoc(scoresRef, postObj);
    return { message: "Quest inserted!", code: "ADDED" };
  } catch (error) {
    console.error("Error adding quest", error);
    throw error;
  }
};

export const getAllQuests = async () => {
  try {
    const scoresRef = collection(db, "quests");
    const querySnapshot = await getDocs(scoresRef);

    if (!querySnapshot.empty) {
      const quests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return quests;
    }
    return [];
  } catch (error) {
    console.error("Error retrieving quests", error);
    throw error;
  }
};

export const getQuestByTokenId = async (tokenId: number) => {
  try {
    const scoresRef = collection(db, "quests");

    // Create a query to filter quests by tokenId
    const q = query(scoresRef, where("tokenId", "==", tokenId));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const quest = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];
      return quest;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving quest by tokenId", error);
    throw error;
  }
};

