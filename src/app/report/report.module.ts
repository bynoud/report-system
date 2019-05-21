import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report.routes';
import { ReportComponent } from './report.component';
import { ReportSummaryComponent } from './report-summary/report-summary.component';
import { ReportUserComponent } from './report-user/report-user.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskNewComponent } from './task-new/task-new.component';
import { FlashMessageModule } from 'src/app/core/flash-message/flash-message.module';
import { ReportSummaryDetailComponent } from './report-summary/report-summary-detail.component';
import { ReportService } from './report.service';
import { SharedModule } from '../core/shared.module';

@NgModule({
  declarations: [
    ReportComponent,
    ReportSummaryComponent,
    ReportSummaryDetailComponent,
    ReportUserComponent,
    NavbarComponent,
    TaskDetailComponent,
    TaskNewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlashMessageModule,
    ReportRoutingModule,
    SharedModule
  ],
  providers: [ReportService]
})
export class ReportModule { }
