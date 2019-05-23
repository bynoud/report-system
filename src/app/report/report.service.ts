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
    onTaskChanged(userID: string, next: (tasks: Task[]) => any) {
        const sub = this.onTaskChanged$(userID).subscribe(next)
        this.subcriptions.push(sub)
        return sub
    }

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

    // values = {project, title, desc, dueMs, targets[]}
    addTask(userID: string, values: any): Promise<Task> {
        return this._addTask(userID, values.project, values.title,
            values.desc, values.dueMs, values.targets)
    }

    private _addTask(userID: string, project: string, title: string, desc: string,
        dueMs: number, targets: Target[]): Promise<Task> {
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
        targets.forEach(target => {
            bw.set(this.fs.collection(`${taskdoc}/targets`).doc(), target)
        })
        this.addDuedate(taskdoc, dueMs, bw);
        this.addComm(task, "NewTask", `${task.uid}@@${project}@@${title}`, bw)
        return bw.commit().then(() => { return task })
            // FIXME .catch(err => this.error(err))
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
        return bw.commit()//FIXME .catch(err => this.error(err))
    }

    
    addTarget(task: Task, desc: string, status: Status) {
        var bw = this.fs.batch();
        var path = `reports/${task.userID}/tasks/${task.uid}/targets`;
        var taskref = this.fs.collection(path).doc();
        bw.update(taskref, {uid: taskref.id, desc, status})
        this.addComm(task, "NewTarget", `${taskref.id}@@${status}@@${desc}`, bw)
        return bw.commit()//FIXME .catch(err => this.error(err))
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
        return this.afs.collection<DueDate>(path).valueChanges().pipe(
            map(vals => vals.reverse()),
            catchError(err => this.error(err))
        )
    }
    onDuedatesChanged(task: Task, next: (duedates: DueDate[]) => any) {
        const sub = this.onDuedatesChanged$(task).subscribe(next)
        this.subcriptions.push(sub)
        return sub
    }

    onTargetsChanged$(task: Task) {
        const path = `reports/${task.userID}/tasks/${task.uid}/targets`;
        return this.afs.collection<Target>(path).valueChanges().pipe(
            map(vals => vals.reverse()),
            catchError(err => this.error(err))
        )
    }
    onTargetsChanged(task: Task, next: (targets: Target[]) => any) {
        const sub = this.onTargetsChanged$(task).subscribe(next)
        this.subcriptions.push(sub)
        return sub
    }

    onCommentsChanged$(task: Task) {
        var path = `reports/${task.userID}/tasks/${task.uid}/comments`;
        return this.afs.collection<Comment>(path).valueChanges().pipe(
            map(vals => vals.reverse()),
            catchError(err => this.error(err))
        )
    }
    onCommentsChanged(task: Task, next: (comms: Comment[]) => any) {
        const sub = this.onCommentsChanged$(task).subscribe(next)
        this.subcriptions.push(sub)
        return sub
    }
    
    error(err: any) {
        console.error(err)
        this.msgService.error("Something when wrong. This normally caused by an unhealthy network")
        return Promise.resolve(null)
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