import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase';

admin.initializeApp();
const fs = admin.firestore();

export function serverTime() { return admin.firestore.FieldValue.serverTimestamp() }
export function fromMillis(ms: number) { return firestore.Timestamp.fromMillis(ms); }

function getRoleLevel(role: string) {
    if (role == 'admin') { return 999999999 }
    let lvl = +role.substring(2);
    if (lvl >= 1000) lvl = 999;
    if (role[0] == 't') return lvl;
    else return lvl+1000;
}

// create User
exports.createUser = functions.https.onCall((data, context) => {
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
        return fs.doc(`users/${uid}`).set(vals)
    } else {
        throw new functions.https.HttpsError('failed-precondition',
            'login is required'
        )
    }
})

// update user
async function getUser(uid: string) {
    return await fs.doc(`users/${uid}`).get().then(snaps => {
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


exports.updateUser = functions.https.onCall( async (data, context) => {
    console.log("updateUser is called", data, context)
    if (context && context.auth) {
        const check = await checkPermission(context.auth.uid, data)
        if (getRoleLevel(check.auth.role) < getRoleLevel(check.update.role))
            return Promise.reject("Can only set role as high as your current level")

        return fs.doc(`users/${data.uid}`).update(data)
    } else {
        throw new functions.https.HttpsError('failed-precondition', 'login is required')
    }
})

// // Tasks related

// // data = {userID, project, title, desc, dueMs, targets[{desc:}]}
// function addTask(activeID: string, userID: string, project:
//     string, title: string, desc: string,
//     dueMs: number, targets: {desc: string}[]) {
    
//     checkPermission(activeID, userID);

//     const taskRef = fs.collection(`reports/${userID}/tasks`).doc();

//     const task = {
//         project, title, desc, userID,
//         status: "OPEN",
//         due : fromMillis(dueMs),
//         enteredAt: serverTime(),
//         updatedAt: serverTime(),
//         uid: taskRef.id,
//     }
//     var bw = fs.batch();
//     bw.set(taskRef, task);
//     targets.forEach(target => addTarget(task, target.desc, "PENDING", bw))
//     addDuedate(userID, taskRef.path, dueMs, bw);
//     addComm(task, "NewTask", `${task.uid}@@${project}@@${title}`, bw)
//     return bw.commit()
// }

// function addDuedate(userID: string, taskPath: string, dueMs: number, batch: FirebaseFirestore.WriteBatch) {
//     const dueref = fs.collection(`${taskPath}/dueDates`).doc();
//     batch.set(dueref, {
//         at: serverTime(), by: userID, due: fromMillis(dueMs)
//     })
// }

// function reDue(task, dueMs: number) {
//     var taskdoc = `reports/${task.userID}/tasks/${task.uid}`;
//     // using batch write for automic write
//     var bw = fs.batch();
//     bw.update(fs.doc(taskdoc), {'due': fromMillis(dueMs)});
//     addDuedate(task.userID, taskdoc, dueMs, bw)
//     addComm(task, "Redue", `${task.due.toMillis()}@@${dueMs}`, bw)
//     return bw.commit()
// }


// function addTarget(task, desc: string, status: string, batch: FirebaseFirestore.WriteBatch = null) {
//     let needCommit = false;
//     if (batch==null) {
//         needCommit = true;
//         batch = fs.batch();
//     }
//     var path = `reports/${task.userID}/tasks/${task.uid}/targets`;
//     var taskref = fs.collection(path).doc();
//     batch.set(taskref, {
//         at: serverTime(),
//         uid: taskref.id,
//         desc, status
//     })
//     addComm(task, "NewTarget", `${taskref.id}@@${status}@@${desc}`, batch)
//     if (needCommit) return batch.commit()
//     else return null
// }

// function targetStatus(task, target, status) {
//     var bw = this.fs.batch();
//     var taskref = this.fs.doc(`reports/${task.userID}/tasks/${task.uid}/targets/${target.uid}`);
//     bw.update(taskref, {status})
//     this.addComm(task, "UpdateTarget", `${target.uid}@@${target.desc}@@${target.status}@@${status}`, bw);
//     return bw.commit()//FIXME .catch(err => this.error(err))
// }

// addComment(task: Task, comm: string) {
//     return this.addComm(task, "Comment", comm)
// }

// closeTask(task: Task) {
//     return this.addComm(task, "CloseTask", `${nowMillis()}`);
// }

// private addComm(task: Task, type: CommentType, text: string,
//     batch: firestore.WriteBatch = null) {
//     var doCommit = false;
//     var taskdoc = `reports/${task.userID}/tasks/${task.uid}`;
//     if (batch == null) {
//         batch = this.fs.batch();
//         doCommit = true;
//     }
//     var commref = this.fs.collection(`${taskdoc}/comments`).doc();
//     batch.set(commref, {
//         // serverTime() will only valid after the entry submitted
//         // this cause error when we subcribe to a valueChanges(), since it return a local value with 'null'
//         uid: commref.id, at: nowTimestamp(), by: this.userID, type, text
//     })
//     // assume a comment is added mean task still open
//     batch.update(this.fs.doc(taskdoc), {updatedAt: nowTimestamp(),
//         status: (type=="CloseTask")? "CLOSED" : "OPEN"})
//     if (doCommit) return batch.commit()//FIXME .catch(err => this.error(err))
//     else return null
// }
