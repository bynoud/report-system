import * as functions from 'firebase-functions';
import { fbmsg, fbstore } from './app-init';

// /reports/{userID}/fcm/       <collection>
//      tokens: string[]        <field>

// const SUMMARY_SINCE_MS = 7 * 24 * 60 * 60 * 1000;

async function notifyDevices(uids: string[], title: string, body: string, key: string) {
    const tokens: string[] = [];
    for (const uid of uids) {
        tokens.push(... await fbstore.doc(`secrets/${uid}/services/fcm`).get().then(snaps => {
            const data = snaps.data();
            if (data && data['tokens']) return <string[]>data['tokens'];
            else return [];
        }));
    }
    const msg = {
        notification: {
            title, body,
            // clickAction: 'http://localhost:4200/report',
            // icon: ''
        },
        // webpush: {
        //     headers: {
        //         Urgency: urgency,
        //     },
        //     notification: {
        //         requireInteraction: true,
        //         badge: "/badge-icon.png"
        //     }
        // },
        // TODO : add android & iOS
    }
    if (tokens.length == 0) throw new functions.https.HttpsError('not-found', 'No FCM tokens found');
    else return fbmsg.sendToDevice(tokens, msg, {collapseKey: key})
}

// async function getLateMembers(userID: string, all: boolean) {
//     let query = fbstore.collection('users').where('managerID', '==', userID)
//     let uids = await query.get().then(snaps => snaps.docs.map(doc => <string>doc.data()['uid']))

//     if (!all) {
//         uids = uids.filter(async id => {
//             const lastUpd = await fbstore.doc(`reports/${id}`).get().then(snap => snap.data())
//             if (!(lastUpd && lastUpd['updatedAt'])) return true;    // there's no info, include him
//             const updateMs = (<FirebaseFirestore.Timestamp>lastUpd['updatedAt']).toMillis();
//             const sinceMs = FirebaseFirestore.Timestamp.now().toMillis() - updateMs;
//             return sinceMs >= SUMMARY_SINCE_MS;
//         })
//     }
//     return uids;
// }

export async function remindLateMembers(data: any, context: functions.https.CallableContext) {
    if (context && context.auth) {
        return notifyDevices(data['uids'], "Report Reminder",
            "Your report are missing. Please consider to submit an updated status", 'report-reminder');
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}

