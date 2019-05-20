import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task, StatusList } from 'src/app/models/reports';
import { ReportService } from '../report.service';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.css']
})
export class ReportUserComponent implements OnInit, OnDestroy {

  user: User;
  tasks: Task[];
  subs: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subs.push(this.route.params.subscribe( params => {
      var userID = params['id'];
      console.log("detal id", userID);

      var user$ = userID ? this.authService.getUser$(userID, "from report user") :
                           this.authService.activeUser$;

      this.subs.push(user$.subscribe(user => {
        console.log("detail user", user);          
        this.user = user;
        if (user) {
          this.subs.push(this.reportService.onTaskChanged$(user.uid).subscribe(tasks => {
            this.tasks = tasks;
          }))
        } else {
          this.tasks = [];
        }
      }))
    }))
  }

  ngOnDestroy() {
    console.log("destroy");
    
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
