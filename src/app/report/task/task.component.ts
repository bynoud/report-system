import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from 'src/app/services/firebase/report.service';
import { Task } from 'src/app/models/reports';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  fullname = "My Name";
  userID: string;
  tasks: Task[];
  ready = false;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.ready = false;
      this.userID = params['id']; //['userID'];
      this.reportService.onTaskChanged(this.userID).subscribe(tasks => {
        this.tasks = tasks;
        this.ready = true;
      });
    })
  }
}
