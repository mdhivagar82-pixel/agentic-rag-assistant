import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Register a new user with Email and Password and save profile to Firestore.
 */
export const registerUser = async (
  email: string,
  pass: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Update Auth Profile
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Create User Profile in Firestore
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: displayName || email.split("@")[0],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
};

/**
 * Log in existing user with Email and Password.
 */
export const loginUser = async (email: string, pass: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

/**
 * Sign out current user.
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Send password reset email.
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Get User profile document from Firestore.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};
