import { Routes, RouterModule } from "@angular/router";
import { ReportComponent } from './report.component';
import { AuthService as AuthGaurd } from "../services/firebase/auth.service";
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { ReportUserComponent } from './report-user/report-user.component';
import { NgModule } from '@angular/core';
import { TaskNewComponent } from './task-new/task-new.component';

const routes: Routes = [{
    path: 'report', component: ReportComponent, canActivate: [AuthGaurd],
    children: [
        {path: '', component: ReportUserComponent},
        {path: 'sum', component: ReportSummaryComponent},
        {path: ':id', component: ReportUserComponent},
        {path: ':id/new', component: TaskNewComponent},
    ]
}]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportRoutingModule {}
