import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService, ReportSummary, ReportSummaries } from '../report.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css'],
})
export class ReportSummaryComponent implements OnInit, OnDestroy {

  summaries: ReportSummaries[] = [];
  unsubFns: ()=>void;
  ready = false;

  constructor(
    private reportService: ReportService,
  ) {
    console.log("report construct");
  }

  ngOnInit() {
    console.log(this.unsubFns, this.ready);
    
    this.reportService.getAllSummaries(this.summaries)
      .then(fns => {
        this.unsubFns = fns;
        this.ready = true;
      })
  }

  ngOnDestroy() {
    this.unsubFns()
  }

}
