import { firestore } from 'firebase';

export interface FcmToken {
    uid: string,
    token: string;
    userID: string;
    lastUsed: firestore.Timestamp;
}

export interface FcmData {
    uid: string,
    type: string;
    title: string;
    body: string;
    userID: string;
    // token: string;
}
