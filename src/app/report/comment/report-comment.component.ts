import { Component, OnInit, Input } from '@angular/core';
import { Comment, Task, dateFormat, fromMillis, dateToSince } from 'src/app/models/reports';


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

  constructor(
  ) { }

  ngOnInit() {
    let txt = this.comm.text;
    let secs = txt.split('@@');
    let desc = `[${this.task.project}] ${this.task.title}`;

    if (typeof(this.comm.by) == 'string') {
      this.byDiffUser = this.task.userID != this.comm.by;
    } else {
      this.byDiffUser = this.task.userID != this.comm.by.uid;
    }
    console.log(this.byDiffUser);
    
    this.systemComm = true;

    //"NewTask" | "CloseTask" | "NewTarget" | "UpdateTarget" | "Redue" | "Comment" | "CloseTarget";
    switch (this.comm.type) {
      // case "Comment":
      //   this.text = txt;
      case "NewTask":
        txt = `Opened new task "${desc}"`;
        break;
      case "CloseTask":
        txt = `Closed task "${desc}"`;
        break;
      case "NewTarget":
        // `${taskref.id}@@${status}@@${desc}`
        txt = `Added new Target "${secs[2]}" to Task "${desc}"`;
        break;
      case "UpdateTarget":
        // `${target.uid}@@${target.desc}@@${target.status}@@${status}`
        txt = `Updated "${secs[2]}" -> "${secs[3]}" for Target "${secs[1]}"`;;
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
  }

  msFormat(ms: number) {
    return dateFormat(fromMillis(ms))
  }

  dateFormat(times) {
    return dateFormat(times)
  }

  dateSince(time) {
    return dateToSince(time)
  }

}
