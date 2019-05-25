
/*
  interface firebase.UserInfo {
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    // The user's unique ID.
    uid: string;
  }
*/

export interface User {
  createdAt: firebase.firestore.Timestamp,
  role: string,
  email: string,
  displayName: string,
  photoURL: string,
  uid: string,
  // added
  managerID: string,
}

