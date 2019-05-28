import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { fbstore } from './app-init';

function getRoleLevel(role: string) {
    if (role == 'admin') { return 999999999 }
    let lvl = +role.substring(2);
    if (lvl >= 1000) lvl = 999;
    if (role[0] == 't') return lvl;
    else return lvl+1000;
}

// create User
export function createUser(data: any, context: functions.https.CallableContext) {
    console.log("createUser is called", data, context)
    if (context && context.auth) {
        const uid = context.auth.uid;
        const tok = context.auth.token;
        const vals = {
            email: tok.email,
            displayName: tok.name,
            photoURL: tok.picture,
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uid: uid,
            role: "t-0",
        };
        return fbstore.doc(`users/${uid}`).set(vals)
    } else {
        throw new functions.https.HttpsError('failed-precondition',
            'login is required'
        )
    }
}

// update user
async function getUser(uid: string) {
    return await fbstore.doc(`users/${uid}`).get().then(snaps => {
        if (snaps.exists) return snaps.data()
        else return null;
    })
}

async function checkPermission(activeId: string, updateID: any) {
    const sameId = updateID == activeId;
    const uauth = await getUser(activeId);
    if (uauth == null) return Promise.reject('User have not registered correctly');
    const upd = sameId ? uauth : await getUser(updateID);
    if (upd == null) return Promise.reject('Update user not found');

    if (!sameId) {
        if (upd.managerID != activeId)
            return Promise.reject("You are not direct manager of user")
    }

    return {auth: uauth, update: upd};
}


export async function updateUser(data: any, context: functions.https.CallableContext) {
    console.log("updateUser is called", data, context)
    if (context && context.auth) {
        const check = await checkPermission(context.auth.uid, data)
        if (getRoleLevel(check.auth.role) < getRoleLevel(check.update.role))
            return Promise.reject("Can only set role as high as your current level")

        return fbstore.doc(`users/${data.uid}`).update(data)
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}
