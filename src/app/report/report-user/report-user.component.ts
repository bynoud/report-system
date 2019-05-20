import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task, StatusList } from 'src/app/models/reports';
import { ReportService } from 'src/app/services/firebase/report.service';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/firebase/auth.service';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.css']
})
export class ReportUserComponent implements OnInit {

  user: User;
  tasks: Task[];
  
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.params.subscribe( params => {
      var userID = params['id'];
      console.log("detal id", userID);

      var user$ = userID ? this.authService.getUser$(userID) :
                           this.authService.activeUser$;

      user$.subscribe(user => {
        console.log("detail user", user);          
        this.user = user;
        this.reportService.onTaskChanged(user.uid).subscribe(tasks => {
          this.tasks = tasks;
        })
      })
    })
  }

}
