// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/6.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.2.0/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/6.2.0/firebase-auth.js');
importScripts('https://www.gstatic.com/firebasejs/6.2.0/firebase-firestore.js');
// IndexedDB wrapper
// importScripts('https://unpkg.com/dexie@2.0.4/dist/dexie.js');

// import { firebase } from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/messaging';
// import 'firebase/firestore';

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseCfg = {
  apiKey: "AIzaSyCACPsoN0KDRVrxd9UaEbML94cyEhZPTUs",
  authDomain: "mrvl-report-weekly.firebaseapp.com",
  databaseURL: "https://mrvl-report-weekly.firebaseio.com",
  projectId: "mrvl-report-weekly",
  storageBucket: "mrvl-report-weekly.appspot.com",
  messagingSenderId: "624015740768",
}
firebase.initializeApp(firebaseCfg);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// const auth = firebase.auth();
// const functions = firebase.functions();

/**
 * Returns a promise that resolves with an user ID if available.
 * @return {!Promise<?string>} The promise that resolves with an userID if
 *     available. Otherwise, the promise resolves with empty string.
 */
const getUserID = () => {
  return new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user ? user.uid : "")
    });
  });
};

// get current FCM token
const getFcmToken = () => {
  console.log("permission", Notification.permission);
  return messaging.getToken();
}

const checkFcmToken = async (data) => {
  // if current user is different, ask server to remove this. I know it's not secured, but I don't find any better way for now...
  const userID = await getUserID();
  const token = await getFcmToken();
  console.log("checking token", userID, data, token);
  if (!token || !userID || !data || (data.userID != userID)) {
    console.log("remove token", userID, token)
    // await functions.httpsCallable('removeFcmToken')({userID, token})
    await firebase.firestore().doc(`secrets/${data.userID}/fcmTokens/${data.uid}`).delete()
    return false;
  }
  return true;
}

messaging.setBackgroundMessageHandler(async function(payload) {
  const data = payload.data;
  console.log('[firebase-messaging-sw.js] Received background message ', payload, data);

  const ok = await checkFcmToken(data)
  if (ok) {
    // Customize notification here
    const notificationTitle = `Background Message - ${data.type} - ${data.title}`;
    const notificationOptions = {
      body: `Background Message body: ${data.body}`,
      icon: '/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
  }
});
