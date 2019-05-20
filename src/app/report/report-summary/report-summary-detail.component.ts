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
    @Input() userID: string;
    @Input() summary: ReportSummary[];
    user: User;
    subs: Subscription[] = [];

    constructor(
        private authService: AuthService,
        private reportService: ReportService,
    ) {}

    ngOnInit() {
        this.subs.push(this.authService.getUser$(this.userID, "from report sum detail").subscribe(user => {
            this.user = user;
            console.log("sumdetail", this.user);
            
        }))
    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe())
    }
}