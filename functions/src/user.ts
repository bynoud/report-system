import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { fbstore } from './app-init';

function getRoleLevel(role: string, level: number) {
    if (role == 'admin') { return 999999999 }
    if (level >= 1000) {
        throw new Error('the role level is wrongly set');
    }
    if (role == 't') return level;
    else return level+1000;
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
            companyEmail: "",
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uid: uid,
            role: "t",
            level: 0,
        };
        const bw = fbstore.batch()
        bw.set(fbstore.doc(`users/${uid}`), vals)
        // placeholder for all setting here
        bw.set(fbstore.doc(`secrets/${uid}`), {fcmTokens: []})
        return bw.commit();
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
    if (uauth == null) throw new Error('User have not registered correctly');
    const upd = sameId ? uauth : await getUser(updateID);
    if (upd == null) throw new Error('Update user not found');

    if (!sameId) {
        if (upd.managerID != activeId)
            throw new Error("You are not direct manager of user");
    }

    return {auth: uauth, update: upd};
}



async function _setRole(activeID: string, updateID: string, role: string, level: number) {

    console.log("setRole", activeID, updateID, role);
    const check = await checkPermission(activeID, updateID);
    if (getRoleLevel(check.auth.role, check.auth.level) < getRoleLevel(role, level)) {
        throw new Error("Can only set role as high as your current level");
    }
    return fbstore.doc(`users/${updateID}`).update({role, level});
}
export function setRole(data: any, context: functions.https.CallableContext) {
    if (context && context.auth) {
        return _setRole(context.auth.uid, data.userID, data.role, data.level);
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}

async function _setManager(activeID: string, managerID: string) {
    console.log('setManager', activeID, managerID);
    const manager = await getUser(managerID);
    if (!manager) throw new Error("Unknown user ID");
    if (manager.role!='m') throw new Error("Not a manager");
    return fbstore.doc(`users/${activeID}`).update({managerID: managerID});
}
export function setManager(data: any, context: functions.https.CallableContext) {
    if (context && context.auth) {
        return _setManager(context.auth.uid, data.managerID);
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}

export function setCompanyEmail(data: any, context: functions.https.CallableContext) {
    if (context && context.auth) {
        return fbstore.doc(`users/${context.auth.uid}`).update({companyEmail: data.companyEmail})
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
}