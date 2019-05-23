import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ReportService } from './report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private reportService: ReportService
  ) {
  }

  ngOnInit() {
    // this.authService.getUsers$().then(users => {
    //   console.log("report getusers", users);
      
    // })
  }

}
