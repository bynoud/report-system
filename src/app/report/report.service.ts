import { Injectable, OnDestroy } from "@angular/core";
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Task, Status, fromMillis, Target,
    CommentType, DueDate, Comment, nowMillis, nowTimestamp } from 'src/app/models/reports';
import { firestore } from 'firebase';
import { AuthService } from 'src/app/core/services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { User } from '../models/user';

const SUMMARY_SINCE_MS = 7 * 24 * 60 * 60 * 1000;

export type ReportSummary = {task: Task, comms: Comment[]}
export type ReportSummaries = {[uid: string]: {user: User, sums: ReportSummary[]}}

@Injectable()
export class ReportService implements OnDestroy {
    fs: firestore.Firestore;
    userID: string;
    subcriptions: Subscription[] = [];
    subs: Subscription[] = [];

    constructor(
        private authService: AuthService,
        private afs: AngularFirestore,
        private msgService: FlashMessageService
    ){
        this.fs = afs.firestore
        
        this.subs.push(this.authService.activeUser$.subscribe(user => {
            console.log("report service user", user);
            
            if (user) this.userID = user.uid
            else {
                this.userID = "<not logged in>"
                this.unsubAll()
            }
        }))
    }

    
    ngOnDestroy() {
        console.log("is destroy");
        this.unsubAll();
        this.subs.forEach(sub => sub.unsubscribe())
    }

    // initial get a first snapshot of task, then base on how the task added/remove to 
    // return
    // [0] pointer to task array
    // [1] () => void, used to unsubcribe
    getTaskUpdates(userID: string): Promise<[Task[], ()=>void]> {
        return new Promise<any>((resolve, reject) => {
            let tasks: Task[] = [];
            const unsub = this.fs.collection(`reports/${userID}/tasks`)
            .where("status", "==", "OPEN").orderBy("updatedAt", "desc")
            .onSnapshot(
                // next
                snaps => {
                    console.warn("sanpshot----");
                    
                    snaps.docChanges().forEach(change => {
                        console.log("change", change, change.doc.data())
                        const update = <Task>change.doc.data();
                        const [oid, nid] = [change.oldIndex, change.newIndex];
                        if (change.type == "added") {
                            tasks.push(update)
                        } else if(change.type == "removed") {
                            tasks.splice(oid, 1)
                        } else {
                            // if (change.type == "modified")
                            if (oid != nid) {
                                // the order had been changed
                                // [tasks[oid], tasks[nid]] = [tasks[nid], tasks[oid]];    // angular will correctly swap component value, without recreate them
                                // WARN : Dont change the order of display list, it's anoying
                            } else {
                                // the content is changed
                                for (let k in update) {
                                    tasks[change.oldIndex][k] = update[k];
                                }
                            }
                        }
                    })

                    // resolve promise
                    resolve([tasks, unsub]);
                },
                // error
                err => { this.error(err); reject(err) }
            )
        })
        // return this.fs.collection(`reports/${userID}/tasks`)
        //     .where("status", "==", "OPEN").orderBy("updatedAt", "desc")
        //     .onSnapshot(
        //         // next
        //         snaps => {
        //             console.warn("sanpshot----");
                    
        //             snaps.docChanges().forEach(change => {
        //                 console.log("change", change, change.doc.data())
        //                 const update = <Task>change.doc.data();
        //                 const [oid, nid] = [change.oldIndex, change.newIndex];
        //                 if (change.type == "added") {
        //                     tasks.push(update)
        //                 } else if(change.type == "removed") {
        //                     tasks.splice(oid, 1)
        //                 } else {
        //                     // if (change.type == "modified")
        //                     if (oid != nid) {
        //                         // the order had been changed
        //                         // [tasks[oid], tasks[nid]] = [tasks[nid], tasks[oid]];    // angular will correctly swap component value, without recreate them
        //                         // WARN : Dont change the order of display list, it's anoying
        //                     } else {
        //                         // the content is changed
        //                         for (let k in update) {
        //                             tasks[change.oldIndex][k] = update[k];
        //                         }
        //                     }
        //                 }
        //             })
        //         },
        //         // error
        //         err => this.error(err)
        //     )
    }

    // WARN: This will cause View to be destroyed & rerender
    onTaskChanged$(userID: string) {
        // this one give 2 emitted. one in 'local' (seem like that) and one form server
        
        return this.afs.collection<Task>(`reports/${userID}/tasks`, ref => {
            return ref.where("status", "==", "OPEN").orderBy("uid", "desc")
        }).valueChanges().pipe(
            catchError(err => this.error(err)) //Observable.throw(this.error(err)))
        )
        // .pipe(
        //     map(vals => vals.reverse())
        // )
    }
    // onTaskChanged(userID: string, next: (tasks: Task[]) => any) {
    //     const sub = this.onTaskChanged$(userID).subscribe(next)
    //     this.subcriptions.push(sub)
    //     return sub
    // }

    // populate the sub-collection fields: dueDates.by, comment.by
    private async populateComment(obj: Comment) {
        if (typeof(obj.by) == "string") obj.by = await this.authService.getUser$(obj.by);
        return obj;
    }
    private async populateDuedate(obj: DueDate) {
        if (typeof(obj.by) == "string") obj.by = await this.authService.getUser$(obj.by);
        return obj;
    }

    // Gather comment in last 7 days, group by user
    async getSummary(): Promise<ReportSummaries> {
        var sinceDate = fromMillis(nowMillis() - SUMMARY_SINCE_MS);
        const taskSnaps = await this.fs.collectionGroup('tasks')
            .where('updatedAt', ">", sinceDate).orderBy("updatedAt", "desc").get()
            // FIXME .catch(err => this.error(err))
        if (!taskSnaps) return Promise.resolve({})

        // console.log("sum", taskSnaps);
        var sums: ReportSummaries = {};
        for (const doc of taskSnaps.docs) {
            let sum: ReportSummary = {task: <Task>doc.data(), comms: []};
            let uid = sum.task.userID;

            const comSnaps = await doc.ref.collection('comments')
                .where('at', '>', sinceDate).orderBy('at', 'desc').get()
                //FIXME .catch(err => this.error(err))
            if (comSnaps) {
                // console.log("  comm", comSnaps);
                for (let doc of comSnaps.docs) {
                    sum.comms.push(await this.populateComment(<Comment>doc.data()))
                }
                if (!(uid in sums)) sums[uid] = {
                    user: await this.authService.getUser$(uid),
                    sums: [],
                };
                sums[uid].sums.push(sum)
            }
        }
        
        return sums;
    }

    // values = {project, title, desc, dueMs, targets[{desc:}]}
    addTask(userID: string, values: any): Promise<Task> {
        return this._addTask(userID, values.project, values.title,
            values.desc, values.dueMs, values.targets)
    }

    private _addTask(userID: string, project: string, title: string, desc: string,
        dueMs: number, targets: {desc: string}[]): Promise<Task> {
        var task: Task = {
            project, title, desc, userID,
            status: "OPEN",
            due : fromMillis(dueMs),
            enteredAt: nowTimestamp(),
            updatedAt: nowTimestamp(),
            uid: this.afs.createId(),
        }
        var taskdoc = `reports/${userID}/tasks/${task.uid}`;
        var bw = this.fs.batch();
        bw.set(this.fs.doc(taskdoc), task);
        targets.forEach(target => this.addTarget(task, target.desc, "PENDING", bw))
        this.addDuedate(taskdoc, dueMs, bw);
        this.addComm(task, "NewTask", `${task.uid}@@${project}@@${title}`, bw)
        return bw.commit().then(() => { return task }).catch(this.raise)
    }

    private addDuedate(taskPath: string, dueMs: number, batch: firestore.WriteBatch) {
        var dueref = this.fs.collection(`${taskPath}/dueDates`).doc();
        batch.set(dueref, {
            at: nowTimestamp(), by: this.userID, due: fromMillis(dueMs)
        })
    }

    reDue(task: Task, dueMs: number) {
        var taskdoc = `reports/${task.userID}/tasks/${task.uid}`;
        // using batch write for automic write
        var bw = this.fs.batch();
        bw.update(this.fs.doc(taskdoc), {'due': fromMillis(dueMs)});
        this.addDuedate(taskdoc, dueMs, bw)
        this.addComm(task, "Redue", `${task.due.toMillis()}@@${dueMs}`, bw)
        return bw.commit().catch(err => this.error(err))
    }

    
    addTarget(task: Task, desc: string, status: Status, batch: firestore.WriteBatch = null) {
        let needCommit = false;
        if (batch==null) {
            needCommit = true;
            batch = this.fs.batch();
        }
        var path = `reports/${task.userID}/tasks/${task.uid}/targets`;
        var taskref = this.fs.collection(path).doc();
        batch.set(taskref, {
            at: nowTimestamp(),
            uid: taskref.id,
            desc, status
        })
        this.addComm(task, "NewTarget", `${taskref.id}@@${status}@@${desc}`, batch)
        if (needCommit) return batch.commit().catch(err => this.error(err))
        else return null
    }

    targetStatus(task: Task, target: Target, status: Status) {
        var bw = this.fs.batch();
        var taskref = this.fs.doc(`reports/${task.userID}/tasks/${task.uid}/targets/${target.uid}`);
        bw.update(taskref, {status})
        this.addComm(task, "UpdateTarget", `${target.uid}@@${target.desc}@@${target.status}@@${status}`, bw);
        return bw.commit()//FIXME .catch(err => this.error(err))
    }

    addComment(task: Task, comm: string) {
        return this.addComm(task, "Comment", comm)
    }

    closeTask(task: Task) {
        return this.addComm(task, "CloseTask", `${nowMillis()}`);
    }

    private addComm(task: Task, type: CommentType, text: string,
        batch: firestore.WriteBatch = null) {
        var doCommit = false;
        var taskdoc = `reports/${task.userID}/tasks/${task.uid}`;
        if (batch == null) {
            batch = this.fs.batch();
            doCommit = true;
        }
        var commref = this.fs.collection(`${taskdoc}/comments`).doc();
        batch.set(commref, {
            // serverTime() will only valid after the entry submitted
            // this cause error when we subcribe to a valueChanges(), since it return a local value with 'null'
            uid: commref.id, at: nowTimestamp(), by: this.userID, type, text
        })
        // assume a comment is added mean task still open
        batch.update(this.fs.doc(taskdoc), {updatedAt: nowTimestamp(),
            status: (type=="CloseTask")? "CLOSED" : "OPEN"})
        if (doCommit) return batch.commit()//FIXME .catch(err => this.error(err))
        else return null
    }


    onDuedatesChanged$(task: Task) {
        const path = `reports/${task.userID}/tasks/${task.uid}/dueDates`;
        return this.afs.collection<DueDate>(path, ref => ref.orderBy("at", "desc"))
            .valueChanges()
            .pipe(catchError(err => this.error(err))
        )
    }
    // onDuedatesChanged(task: Task, next: (duedates: DueDate[]) => any) {
    //     const sub = this.onDuedatesChanged$(task).subscribe(next)
    //     this.subcriptions.push(sub)
    //     return sub
    // }

    onTargetsChanged$(task: Task) {
        const path = `reports/${task.userID}/tasks/${task.uid}/targets`;
        return this.afs.collection<Target>(path, ref => ref.orderBy("at", "desc"))
            .valueChanges()
            .pipe(catchError(err => this.error(err))
        )
    }
    // onTargetsChanged(task: Task, next: (targets: Target[]) => any) {
    //     const sub = this.onTargetsChanged$(task).subscribe(next)
    //     this.subcriptions.push(sub)
    //     return sub
    // }

    // Don'd destroy the comment list, just append to it. When a new comment added, auto push on first of array
    // Return Promise of array:
    // [0] next() => boolean, when called will add next comments to array, return true if this is last comment
    // [1] unsub() => void, use to detach listener
    private snapsToComment(snaps: firestore.QuerySnapshot) {
        return snaps.docs.map(doc => <Comment>doc.data())
    }

    async getPaginationComments$(task: Task, max: number, latestComms: Comment[], comms: Comment[], type: CommentType = null):
            Promise<[()=>Promise<boolean>, ()=>void]> {

        const colRef = this.fs.collection(`reports/${task.userID}/tasks/${task.uid}/comments`);
        let query = type ? colRef.where('type', '==', type).orderBy('at', 'desc') :
                           colRef.orderBy('at', 'desc');

        let lastSeen: firestore.QueryDocumentSnapshot = null;
        let firstSeen: firestore.QueryDocumentSnapshot = null;

        // First, get comment added within 7 days
        const latestSnaps = await query.where('at', '>', fromMillis(nowMillis() - SUMMARY_SINCE_MS))
            .get().catch(err => this.msgService.error(err))
        if (!latestSnaps) return [null, null];
        latestComms.push(...this.snapsToComment(latestSnaps))

        if (latestSnaps.size > 0) {
            lastSeen = latestSnaps.docs[latestSnaps.size - 1];
            firstSeen = latestSnaps.docs[0];
        }

        // query to get last 'max' comments     
        const nextComments = lastSeen==null ? () => { return Promise.resolve(true)} : // do nothing, there's no more to fetch
            () => {
                return query.startAfter(lastSeen).limit(max).get()
                    .then(snaps => {
                        lastSeen = snaps.docs[snaps.size - 1];
                        comms.push(...this.snapsToComment(snaps));
                        return snaps.docs.length < max;
                    })
                    .catch(err => {
                        this.error(err);
                        return true;
                    })
            }
        await nextComments();   // run it to get initial value

        // We only add comment, there's no other activities here
        const newCommentQuery = firstSeen ? query.endBefore(firstSeen) : query;
        const newComUnsub = newCommentQuery.onSnapshot(
            snaps => {
                snaps.docChanges().forEach(change => {
                    // just to make sure
                    if (change.type == "added") {
                        latestComms.unshift(<Comment>change.doc.data())
                    }
                })
            },
            err => this.error(err)
        )

        return [nextComments, newComUnsub];
    }


    onCommentsChanged$(task: Task) {
        var path = `reports/${task.userID}/tasks/${task.uid}/comments`;
        return this.afs.collection<Comment>(path, ref => ref.orderBy('at', 'desc'))
            .valueChanges()
            .pipe(catchError(err => this.error(err))
        )
    }
    // onCommentsChanged(task: Task, next: (comms: Comment[]) => any) {
    //     const sub = this.onCommentsChanged$(task).subscribe(next)
    //     this.subcriptions.push(sub)
    //     return sub
    // }
    
    error(err: any) {
        console.error(err)
        this.msgService.error("Something when wrong. This normally caused by an unhealthy network")
        return Promise.resolve(null)
    }

    raise(err: any) {
        console.error(err)
        this.msgService.error("Something when wrong. This normally caused by an unhealthy network");
        return Promise.reject(err);
    }

    unsub(sub: Subscription) {
        const i = this.subcriptions.indexOf(sub)
        if (i>=0) {
            if (!sub.closed) sub.unsubscribe();
            this.subcriptions.splice(i, 1);
        }
    }

    unsubs(subs: Subscription[]) {
        subs.forEach(sub => this.unsub(sub))
    }

    unsubAll() {
        console.log("reportsrv unsub all");
        this.subcriptions.forEach(sub => { if (!sub.closed) sub.unsubscribe() });
        this.subcriptions = [];
    }


}