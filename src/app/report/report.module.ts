import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report.routes';
import { ReportComponent, ReportLandingComponent } from './report.component';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { ReportUserComponent } from './report-user/report-user.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskNewComponent } from './task-new/task-new.component';
import { ReportSummaryDetailComponent } from './report-summary/report-summary-detail.component';
import { ReportService } from './report.service';
import { SharedModule } from '../core/shared.module';
import { TaskTargetComponent } from './task-detail/task-target.component';
import { ReportCommentComponent } from './comment/report-comment.component';
import { ReportTestComponent } from './report-user/report-test.component';
import { ReportCommentListComponent } from './comment/report-comment-list.component';

@NgModule({
  declarations: [
    ReportComponent,
    ReportLandingComponent,
    ReportSummaryComponent,
    ReportSummaryDetailComponent,
    ReportUserComponent,
    TaskDetailComponent,
    TaskTargetComponent,
    TaskNewComponent,
    ReportCommentComponent,
    ReportCommentListComponent,
    ReportTestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportRoutingModule,
    SharedModule
  ],
  providers: [ReportService]
})
export class ReportModule { }
