import { Component, OnInit, Input } from '@angular/core';
import { Task, Comment, DueDate, Target, nowMillis, Status, StatusList } from 'src/app/models/reports';
import { ReportService } from 'src/app/services/firebase/report.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const WARN_PERIOD = 3;  // issue warning before 3 days

const STATUS_CFGS: {[s:string]: {desc: string, icon: string, color: string}} = {
  "DONE": {
    desc: "This Task was finished",
    icon: "fa-info-circle", 
    color: 'var(--success)'
  },
  "OK": {
    desc: "This Task is going well",
    icon: "fa-info-circle", 
    color: 'var(--success)'
  },
  "WARNING": {
    desc: "",  // add you explanation here
    icon: "fa-exclamation-circle", 
    color: 'var(--warning)'
  },
  "CRITICAL": {
    desc: "This Task is overdue",
    icon: "fa-exclamation-triangle", 
    color: 'var(--danger)'
  },
  "SUSPENED": {
    desc: "This Task was suspended",
    icon: "fa-exclamation-triangle",
    color: 'var(--gray)'
  },
}

const TARGET_CFGS: {[s: string]: {icon: string, desc: string, next: Status[]}} = {
  PENDING: {
    icon: "fas fa-hourglass-start",
    desc: "This Target is not started",
    next: ["ONGOING", "SUSPENDED", "DISCARDED"],
  },
  ONGOING: {
    icon: "fas fa-play",
    desc: "This Target is active",
    next: ["SUSPENDED", "DISCARDED", "DONE"],
  },
  SUSPENDED: {
    icon: "fas fa-pause",
    desc: "This Target has been suspended",
    next: ["ONGOING", "DISCARDED"],
  },
  DISCARDED: {
    icon: "fas fa-trash-alt",
    desc: "This Target was removed",
    next: ["ONGOING"],
  },
  DONE: {
    icon: "fas fa-check",
    desc: "This Target was finished",
    next: ["ONGOING"]
  }
}

const NEXT_TARGET_DESC = {
  ONGOING: " this Target",  // 'Start'/'Resume'/"Re-open"
  SUSPENDED: "Suspend this Target with reason ...",
  DISCARDED: "Removed this Target with reason ...",
  DONE: "Mark this Target as Finished with comment ...",
}

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  @Input() task: Task;
  comments: Comment[] = [];
  duedates: DueDate[] = [];
  targets: Target[] = [];

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
    this.reportService.onCommentsChanged(this.task)
      .subscribe(comments => {
        this.comments = comments;
        console.log("get comms", this.comments);
        
        this.updateStatus();
      })
    this.reportService.onTargetsChanged(this.task)
      .subscribe(targets => {
        this.targets = targets
        this.updateStatus();
      })
    this.reportService.onDuedatesChanged(this.task)
      .subscribe(duedates => {
        this.duedates = duedates
        this.updateStatus();
      })

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
  }

  getTargetIcon(target: Target) {
    return this.sanitizer.bypassSecurityTrustStyle(TARGET_CFGS[target.status].icon)
  }

  getNextTargets(target: Target) {
    var stt = target.status;
    return TARGET_CFGS[stt].next.map(s => {
      var desc = NEXT_TARGET_DESC[s];
      if (s=="ONGOING") {
        desc = (stt=='PENDING'? "Start" :
                stt=='SUSPENDED' ? "Resume" : "Re-open") + desc;
      }
      return {name: s, desc: desc}
    });
  }

  getTargetStatusDesc(target: Target) {
    return TARGET_CFGS[target.status].desc;
  }

  createForm() {
    this.commForm = new FormGroup({
      comm: new FormControl('', Validators.required),
    })

    var today = new Date();
    this.model.redueDate = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
  }

  newComment() {
    this.reportService.addComment(this.task, this.commForm.value.comm);
  }

  submitRedue() {
    this.reportService.reDue(this.task, Date.parse(this.model.redueDate))
  }

  submitTargetStatus(target: Target, stt: Status) {    
    this.reportService.targetStatus(this.task, target.uid, stt)
  }

  dateFormat(timestamp: firebase.firestore.Timestamp) {
    var d = timestamp.toDate();
    return d.toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'});
  }

}
