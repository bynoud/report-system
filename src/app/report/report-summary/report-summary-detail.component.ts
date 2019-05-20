import { Component, OnInit, Input } from "@angular/core";
import { ReportSummary, ReportService } from 'src/app/services/firebase/report.service';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { User } from 'src/app/models/user';

@Component({
    selector: "app-report-summary-detail",
    templateUrl: "./report-summary-detail.component.html",
})
export class ReportSummaryDetailComponent implements OnInit {
    @Input() userID: string;
    @Input() summary: ReportSummary[];
    user: User;

    constructor(
        private authService: AuthService,
        private reportService: ReportService,
    ) {}

    ngOnInit() {
        this.authService.getUser$(this.userID).subscribe(user => {
            this.user = user;
            console.log("sumdetail", this.user);
            
        })
    }
}