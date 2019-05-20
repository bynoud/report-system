import { Component, OnInit } from '@angular/core';
import { ReportService, ReportSummary } from 'src/app/services/firebase/report.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css'],
})
export class ReportSummaryComponent implements OnInit {

  summaries: {[uid: string]: ReportSummary[]};
  ready = false;

  constructor(
    private reportService: ReportService,
  ) {
    console.log("report construct");
  }

  ngOnInit() {
    this.reportService.getSummary().then(sums => {
      // this.summaries = tasks;
      this.summaries = sums;
      console.log("on report sum", this.summaries);
      this.ready = true;
    })
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
