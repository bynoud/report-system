import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../services/firebase/report.service';
import { Task } from '../models/reports';
import { User } from '../models/user';
import { AuthService } from '../services/firebase/auth.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  constructor(
  ) {
  }

  ngOnInit() {
  }

}
