import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Task, Comment, DueDate, Target, nowMillis, Status, StatusList, dateFormat } from 'src/app/models/reports';
import { ReportService } from '../report.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription, BehaviorSubject } from 'rxjs';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const WARN_PERIOD = 3;  // issue warning before 3 days

const STATUS_CFGS: {[s:string]: {desc: string, icon: string, color: string}} = {
  "DONE": {
    desc: "This Task was finished",
    icon: "fas fa-check-circle", 
    color: 'var(--success)'
  },
  "OK": {
    desc: "This Task is going well",
    icon: "fas fa-info-circle", 
    color: 'var(--info)'
  },
  "WARNING": {
    desc: "",  // add you explanation here
    icon: "fas fa-exclamation-circle", 
    color: 'var(--warning)'
  },
  "CRITICAL": {
    desc: "This Task is overdue",
    icon: "fas fa-exclamation-triangle", 
    color: 'var(--danger)'
  },
  "SUSPENED": {
    desc: "This Task was suspended",
    icon: "fas fa-pause-circle",
    color: 'var(--gray)'
  },
}


@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  @Input() task: Task;
  @Input() index: number;

  comments: Comment[] = [];
  nextCommentsFn: () => Promise<boolean>;
  commUnsubFn: () => void;
  isLastComment: boolean;

  duedates: DueDate[] = [];
  loadingRedue$ = new BehaviorSubject<boolean>(false);

  targets: Target[] = [];
  subs: Subscription[] = [];

  ready = false;

  taskStatus: {
    name: string,
    desc: string,
    icon: string,
    iconColor: SafeStyle
  } = { name: "OK", desc: "", icon: "", iconColor: ""}

  targetStatusList = StatusList;


  commForm: FormGroup;
  // redueDate: string;
  model = {redueDate: ""};

  constructor(
    private sanitizer: DomSanitizer,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    // this.subs.push(this.reportService.onCommentsChanged$(this.task).subscribe(comments => {
    //     this.comments = comments;
    //     this.updateStatus();
    //   }))
    console.log("init task", this.index);
    
    this.subs.push(this.reportService.onTargetsChanged$(this.task).subscribe(targets => {
      this.targets = targets
      this.updateStatus();
    }))
    this.subs.push(this.reportService.onDuedatesChanged$(this.task).subscribe(duedates => {
      duedates.shift(); // dont show current duedate
      this.duedates = duedates
      this.updateStatus();
    }))

    this.createForm();
  }

  // find out what task status, base on the duedate
  updateStatus() {
    var t = this.task;
    var nowMs = nowMillis();
    var now2due = Math.floor((t.due.toMillis() - nowMs) / MS_IN_DAY);
    var status: string;
    var msg: string;
    if (now2due < 0) {
      status = "CRITICAL";
    } else if (now2due < WARN_PERIOD) {
      status = "WARNING";
      msg = `This task is dued within ${now2due+1} days`;
    } else {
      // if no active target, then it's suppened
      var suppened = true;
      var done = true;
      this.targets.forEach(target => {
        var s = target.status;
        if (s != "DONE" && s != "DISCARDED") done = false;
        if (s != "SUSPENDED") suppened = false;
      })
      if (suppened) status = "SUSPENED";
      else if (done) status = "DONE";
      else status = "OK";
    }
    var cfg = STATUS_CFGS[status];    
    this.taskStatus = {
      name: status,
      desc: msg ? msg : cfg.desc,
      icon: cfg.icon,
      iconColor: this.sanitizer.bypassSecurityTrustStyle(cfg.color)
    };
    console.log("target", this.targets);
    
  }


  createForm() {
    this.commForm = new FormGroup({
      comm: new FormControl('', Validators.required),
    })

    var today = new Date();
    today.setDate(today.getDate() + 7);
    this.model.redueDate = `${today.toISOString().split('T')[0]}`
    console.log("redue", this.model.redueDate);
    
  }

  submitRedue() {
    this.loadingRedue$.next(true);
    this.reportService.reDue(this.task, Date.parse(this.model.redueDate))
      .then(() => this.loadingRedue$.next(false))
  }

  dateFormat(timestamp: firebase.firestore.Timestamp) {
    return dateFormat(timestamp)
  }

  ngOnDestroy() {
    console.log("destroy task", this.index);
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
