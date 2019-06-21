import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService, ReportSummary, ReportSummaries } from '../report.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css'],
})
export class ReportSummaryComponent implements OnInit, OnDestroy {

  summaries: ReportSummaries[] = [];
  unsubFns: ()=>void;
  ready = false;
  activeUser: User;

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {
    console.log("report construct");
  }

  ngOnInit() {
    this.getSummaries();
  }

  async getSummaries() {
    console.log(this.unsubFns, this.ready);
    this.activeUser = await this.authService.getActiveUser$()
    this.unsubFns = await this.reportService.getAllSummaries(this.summaries)
    this.ready = true;
  }

  ngOnDestroy() {
    this.unsubFns()
  }

}
