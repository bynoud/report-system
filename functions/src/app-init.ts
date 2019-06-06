import * as admin from 'firebase-admin';

// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     databaseURL: "https://mrvl-report-weekly.firebaseio.com"
//   });
admin.initializeApp();
// on local, add this (absoluted path seem to be required):
// $env:GOOGLE_APPLICATION_CREDENTIALS="C:\MYDATA_DONTSYNC\ng\mtvl-wr\secrets\mrvl-report-weekly-2355927df6b7.json"
  
export const fbstore = admin.firestore();
export const fbmsg = admin.messaging();
