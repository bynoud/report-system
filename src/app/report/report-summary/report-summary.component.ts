import { Component, OnInit } from '@angular/core';
import { ReportService, ReportSummary, ReportSummaries } from '../report.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css'],
})
export class ReportSummaryComponent implements OnInit {

  summaries: ReportSummaries;

  constructor(
    private reportService: ReportService,
  ) {
    console.log("report construct");
  }

  ngOnInit() {
    this.reportService.getSummary().then(sums => this.summaries = sums)
  }

  // groupByUser(tasks: Task[]) {
  //   var sum = {};
  //   tasks.forEach(task => {
  //     var u = task.userID;
  //     if (!(u in sum)) sum[u] = [];
  //     sum[u].push(task)
  //   })
  //   return sum
  // }


}
