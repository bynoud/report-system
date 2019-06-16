import * as functions from 'firebase-functions';
import { fbmsg, fbstore } from './app-init';
// import { FcmToken } from '../../src/app/models/fcm';

interface FcmToken {
    uid: string,
    token: string;
    userID: string;
}

// /reports/{userID}/fcm/       <collection>
//      tokens: string[]        <field>

// const SUMMARY_SINCE_MS = 7 * 24 * 60 * 60 * 1000;

async function notifyDevices(uids: string[], title: string, body: string, type: string) {
    // const tokens: string[] = [];
    // const tokUser: {[tok: string]: string} = {};
    // for (const uid of uids) {
    //     const snaps = await fbstore.collection(`secrets/${uid}/fcmTokens`).get()
    //     snaps.forEach(doc => {
    //         tokens.push(doc.id);
    //         tokUser[doc.id] = doc.data()['userID'];
    //     })
    // }
    const userToks: FcmToken[] = [];
    for (const uid of uids) {
        const tok = await fbstore.collection(`secrets/${uid}/fcmTokens`).get()
            .then(snaps => snaps.docs.map(doc => <FcmToken>doc.data()))
        userToks.push(...tok)
    }
    console.log("sendNotify", uids, userToks)

    
    const msgs: {token: string, data: {[s:string]:string}}[] = [];
    userToks.forEach(tok => {
        msgs.push({
            token: tok.token, 
            data: {type, title, body, userID: tok.userID, uid: tok.uid}
        })
    })
    console.log("notify", userToks, msgs)
    if (userToks.length == 0) {
        return null;
    } else {
        return fbmsg.sendAll(msgs).then(resps => {
            console.log("done", resps.failureCount, resps.successCount);
            const bw = fbstore.batch();
            if (resps.failureCount > 0) {
                resps.responses.forEach((res, idx) => {
                    console.log(idx, res.success)
                    if (!res.success && res.error) {
                        if (res.error.code == 'messaging/invalid-registration-token' ||
                            res.error.code == 'messaging/registration-token-not-registered') {
                            // remove this token from database
                            console.warn("remove token", userToks[idx])
                            bw.delete(fbstore.doc(`secrets/${userToks[idx].userID}/fcmTokens/${userToks[idx].token}`))
                        }
                    }
                })
            }
            return bw.commit();
        })
    }
    // return fbmsg.sendToDevice(tokens, msg, {collapseKey: key})
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
            "Your report are missing. Please consider to submit an updated status", 'remind-late');
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}

export async function removeFcmToken(data: any, context: functions.https.CallableContext) {
    if (context && context.auth) {
        console.warn("remove token", data);
        return fbstore.doc(`secrets/${data['userID']}/fcmTokens/${data['token']}`).delete();
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}

