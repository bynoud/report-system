import * as admin from 'firebase-admin';

const serviceAccount = require('../../secrets/mrvl-report-weekly-2355927df6b7.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mrvl-report-weekly.firebaseio.com"
  });
  
export const fbstore = admin.firestore();
export const fbmsg = admin.messaging();
