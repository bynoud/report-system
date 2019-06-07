import { Component, OnInit, Input } from '@angular/core';
import { Comment, Task, dateFormat, fromMillis, dateToSince } from 'src/app/models/reports';
import { targetTransitionDesc } from '../task-detail/task-target.component';



@Component({
  selector: 'app-report-comment',
  templateUrl: './report-comment.component.html',
  styleUrls: ['./report-comment.component.css']
})
export class ReportCommentComponent implements OnInit {
  @Input() task: Task;
  @Input() comm: Comment;

  systemComm: boolean;
  text: string;
  byDiffUser: boolean;

  dateText: string;

  constructor(
  ) { }

  ngOnInit() {
    let txt = this.comm.text;
    let secs = txt.split('@@');

    if (typeof(this.comm.by) == 'string') {
      this.byDiffUser = this.task.userID != this.comm.by;
    } else {
      this.byDiffUser = this.task.userID != this.comm.by.uid;
    }
    // console.log(this.byDiffUser);
    
    this.systemComm = true;

    //"NewTask" | "CloseTask" | "NewTarget" | "UpdateTarget" | "Redue" | "Comment" | "CloseTarget";
    switch (this.comm.type) {
      // case "Comment":
      //   this.text = txt;
      case "NewTask":
        txt = `Opened this Task`;
        break;
      case "CloseTask":
        txt = `Closed this Task`;
        break;
      case "NewTarget":
        // `${taskref.id}@@${status}@@${desc}`
        txt = `Added new Target "${secs[2]}"`;
        break;
      case "UpdateTarget":
        // `${target.uid}@@${target.desc}@@${target.status}@@${status}`
        txt = `${targetTransitionDesc(secs[2], secs[3], true)} Target "${secs[1]}"`;;
        break;
      case "Redue":
        // `${task.due.toMillis()}@@${dueMs}`
        txt = `Re-schedule ${this.msFormat(+secs[0])} -> ${this.msFormat(+secs[1])}`;;
        break;
      default:
        // there's no known used case of "CloseTarget", assume it not happend
        this.systemComm = false;
    }

    this.text = txt;
    this.dateText = dateToSince(this.comm.at)
    // console.warn(this.comm, this.dateText);
    
  }

  msFormat(ms: number) {
    return dateFormat(fromMillis(ms))
  }

  dateFormat(times) {
    return dateFormat(times)
  }

  dateSince(time) {
    // console.log("call datesince", this.task);
    
    return dateToSince(time)
  }

}
