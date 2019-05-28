
import { firestore } from 'firebase';
import { User } from './user';

// Firestore structure
// reports/     <collection>
//  <userID>/   <doc>
//      tasks/
//          <taskID>
//              userID      : string
//              title       : string
//              desc        : string
//              enteredAt   : Date
//              updatedAt   : Date  <field>
//              due         : Date (last input in 'dueDates')
//              status      : string (CLOSED, OPEN)
//              targets/            <sub-collection>, using array-field is hard to modify it value
//                  <targetID>...
//                      desc    : string
//                      status  : string ("NOT_STARTED" | "ONGOING" | "SUPPENDED" | "DISCARED" | "DONE")
//              /* dueDates    : array -> NOT work, timestamp is not supported inside array
//                  at      : Date
//                  by      : string (userID)
//                  due     : Date
//              */
//              dueDates/           <sub-collection>
//                  <dueID>...
//                      at  : Date
//                      by  : string
//                      due : Date
//              comments/           <sub-collection>
//                  <commentID>...
//                      at              : Date
//                      by              : string (as userID)
//                      targetID        : string
//                      targetStatus    : string
//                  <other_commendID>...
//              
// var b = firestore.Timestamp.fromDate(new Date("December 10, 1815"))
// // Atomically add a new region to the "regions" array field.
// washingtonRef.update({
//     regions: firebase.firestore.FieldValue.arrayUnion("greater_virginia")
// });

// // Atomically remove a region from the "regions" array field.
// washingtonRef.update({
//     regions: firebase.firestore.FieldValue.arrayRemove("east_coast")
// });

const DAY_MS = 24 * 60 * 60 * 1000;

type Datetime = firestore.Timestamp;

export type Status = "PENDING" | "ONGOING" | "SUSPENDED" | "DISCARDED" | "DONE";
export const StatusList = ["PENDING", "ONGOING", "SUSPENDED", "DISCARDED", "DONE"];

export function serverTime() { return <Datetime>firestore.FieldValue.serverTimestamp() }
export function fromMillis(ms: number) { return firestore.Timestamp.fromMillis(ms); }
export function arrayAdd(value: any) { return firestore.FieldValue.arrayUnion(value) }
export function nowTimestamp() { return firestore.Timestamp.now(); }
export function nowMillis() { return firestore.Timestamp.now().toMillis(); }
export function timestampToDate(t: firestore.Timestamp) { return t.toDate() }

export function dateFormat(timestamp: firestore.Timestamp) {
    var d = timestamp.toDate();
    return d.toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'});
}

export function dateToSince(time: firestore.Timestamp | number | string) {
    let now = nowTimestamp().toDate();
    let then: Date;
    if (typeof(time) == "string") {
        then = new Date(+time);
    } else if (time instanceof firestore.Timestamp) {
        then = time.toDate();
    } else {
        then = new Date(time);
    }
    let days = (now.valueOf() - then.valueOf()) / DAY_MS;

    if (now.getFullYear() > then.getFullYear()) return "Years ago"
    else if (now.getMonth() > then.getMonth()) return `${now.getMonth() - then.getMonth()} months ago`
    else if (days > 7) return `${Math.floor(days/7)} weeks ago`
    else if (days >= 1) return `${Math.floor(days)} days ago`
    else return "Today"
}


export interface DueDate {
    at : Datetime,
    by : string | User,
    due : Datetime,
    readonly uid: string,
}

export interface Target {
    at: Datetime,
    desc: string,
    status: Status,
    readonly uid: string,
}

export type CommentType = "NewTask" | "CloseTask" | "NewTarget" | "UpdateTarget" | "Redue" | "Comment" | "CloseTarget";
export interface Comment {
    at : Datetime,
    by : string | User,
    type: CommentType,
    text : string,
    readonly uid: string,
}

export interface Task {
    project: string,
    title: string,
    desc : string,
    due : Datetime,
    status: "CLOSED" | "OPEN",
    updatedAt: Datetime,
    // dueDates: DueDate[],
    readonly enteredAt: Datetime,
    readonly userID: string,
    readonly uid: string,
}


