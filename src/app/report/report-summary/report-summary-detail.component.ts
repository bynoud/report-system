import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ReportSummary, ReportService } from '../report.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/models/user';
import { Subscription } from 'rxjs';

@Component({
    selector: "app-report-summary-detail",
    templateUrl: "./report-summary-detail.component.html",
})
export class ReportSummaryDetailComponent implements OnInit, OnDestroy {
    @Input() user: User;
    @Input() summary: ReportSummary[];

    constructor(
        private authService: AuthService,
        private reportService: ReportService,
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}