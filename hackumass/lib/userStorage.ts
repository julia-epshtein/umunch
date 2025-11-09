// Simple in-memory user storage for demo purposes
// In production, use AsyncStorage or SecureStore

let currentUser: {
  email: string;
  name: string;
} | null = null;

export const setCurrentUser = (email: string, name: string) => {
  currentUser = { email, name };
};

export const getCurrentUser = () => {
  return currentUser;
};

export const clearCurrentUser = () => {
  currentUser = null;
};
