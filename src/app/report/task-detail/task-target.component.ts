import { Component, Input, OnInit } from "@angular/core";
import { Task, Target, Status } from 'src/app/models/reports';
import { ReportService } from '../report.service';

const TARGET_CFGS: {[s: string]: {icon: string, desc: string, next: Status[]}} = {
    PENDING: {
      icon: "fas fa-hourglass-start",
      desc: "This Target has not been started",
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
    selector: 'app-task-target',
    templateUrl: './task-target.component.html',
    styleUrls: ['./task-target.component.css']
})
export class TaskTargetComponent implements OnInit {

    @Input() task: Task;
    @Input() target: Target;
    icon: string;
    desc: string;
    nextTargets: {name: Status, desc: string}[];

    constructor(
        private reportService: ReportService
    ) {}

    ngOnInit() {
        const stt = this.target.status;
        const cfg = TARGET_CFGS[stt];
        this.icon = cfg.icon;
        this.desc = cfg.desc;
        this.nextTargets = cfg.next.map<{name: Status, desc: string}>(tgt => {
            let desc = NEXT_TARGET_DESC[tgt];
            if (tgt=="ONGOING") {
                desc = (stt=='PENDING'? "Start" :
                        stt=='SUSPENDED' ? "Resume" : "Re-open") + desc;
              }
            return {name: tgt, desc: desc}
        })
    }

    
    submitStatus(stt: Status) {    
        console.log("target", this.target)
        this.reportService.targetStatus(this.task, this.target, stt)
    }

}