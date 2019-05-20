
import { firestore } from 'firebase';

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

type Datetime = firestore.Timestamp;
export type Status = "PENDING" | "ONGOING" | "SUSPENDED" | "DISCARDED" | "DONE";
export const StatusList = ["PENDING", "ONGOING", "SUSPENDED", "DISCARDED", "DONE"];

export function serverTime() { return <Datetime>firestore.FieldValue.serverTimestamp() }
export function fromMillis(ms: number) { return firestore.Timestamp.fromMillis(ms); }
export function arrayAdd(value: any) { return firestore.FieldValue.arrayUnion(value) }
export function nowTimestamp() { return firestore.Timestamp.now(); }
export function nowMillis() { return firestore.Timestamp.now().toMillis(); }
export function timestampToDate(t: firestore.Timestamp) { return t.toDate() }

export interface DueDate {
    readonly at : Datetime,
    readonly by : string,
    due : Datetime,
    readonly uid: string,
}

export interface Target {
    desc: string,
    status: Status,
    readonly uid: string,
}

export type CommentType = "NewTarget" | "UpdateTarget" | "Redue" | "Comment" | "Close";
export interface Comment {
    readonly at : Datetime,
    readonly by : string,
    readonly type: CommentType,
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


