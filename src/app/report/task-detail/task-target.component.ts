import { Component, Input, OnInit } from "@angular/core";
import { Task, Target, Status, StatusList } from 'src/app/models/reports';
import { ReportService } from '../report.service';
import { BehaviorSubject } from 'rxjs';

const TARGET_CFGS: {[s: string]: {icon: string, desc: string, next: Status[]}} = {
    PENDING: {
      icon: "fas fa-hourglass-start",
      desc: "This Target has not been started",
      next: ["ONGOING", "SUSPENDED", "DISCARDED", "DONE"],
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

export function targetTransitionDesc(cur: string, nxt: string, pass: boolean) {
  let r: string;
  switch (nxt) {
    case 'ONGOING':
      r = cur=='PENDING'? "Start" :
          cur=='SUSPENDED' ? "Resume" : "Re-open";
      break;
    case 'SUSPENDED':
      r = 'Suspend';
      break;
    case 'DISCARDED':
      r = 'Remove';
      break;
    default:
      r = 'Finish'
  }

  if (pass) {
    const lastChar = r[r.length-1];
    if (lastChar=='e') r += "d";
    // else if (lastChar=='n') r += "ned";
    else r += "ed";
  }
  return r;
}
  
@Component({
    selector: 'app-task-target',
    templateUrl: './task-target.component.html',
    styleUrls: ['./task-target.component.css']
})
export class TaskTargetComponent implements OnInit {

    @Input() task: Task;
    @Input() target: Target;
    @Input() allowModify: boolean;
    @Input() inputCallback: ()=>Promise<void>;

    isInput: boolean;
    icon: string;
    desc: string;
    nextTargets: {name: Status, desc: string}[];

    addingTarget$ = new BehaviorSubject<boolean>(false);

    constructor(
        private reportService: ReportService
    ) {}

    ngOnInit() {
      
      this.isInput = this.inputCallback != null;
      if (this.isInput) this.allowModify = true;

      // console.log(this.allowModify);

      const stt = this.target.status;
      const cfg = TARGET_CFGS[stt];
      this.icon = cfg.icon;
      this.desc = cfg.desc;
      this.nextTargets = cfg.next.map<{name: Status, desc: string}>(tgt => {
          let desc = targetTransitionDesc(stt, tgt, this.isInput);
          if (this.isInput) desc = "Mark it as " + desc;
          else desc += " this Target" + (tgt != "ONGOING" ? " ..." : "");
          return {name: tgt, desc: desc}
      })
    }

    
    submitStatus(stt: Status) {    
        // console.log("target", this.target)
        if (this.isInput) {
          this.target.status = stt;
        } else {
          this.reportService.targetStatus(this.task, this.target, stt)
        }
    }

    addTarget() {
      this.addingTarget$.next(true);
      this.inputCallback().finally(() => this.addingTarget$.next(false));
    }

}