import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ReportService } from './report.service';
import { Router, ActivatedRoute } from '@angular/router';

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

  testing() {
    // this.authService.getUsersSame('managerID')
    //   .then(console.log)
    this.reportService.sendReminder()
  }
}

@Component({
  template: `<app-loading></app-loading>`
})
export class ReportLandingComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getActiveUser$().then(user => {
      if (user) this.router.navigate([user.uid], {relativeTo: this.route})
      else this.router.navigate(['/'])
    })
  }
}
