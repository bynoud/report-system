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
  taskUnsubFn: () => void;

  tests: any[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subs.push(this.route.params.subscribe( params => {
      var userID = params['id'];
      console.log("detal id", userID);

      if (userID) {
        this.authService.getUser$(userID).then(user => this.getTasks(user))
      } else {
        this.subs.push(this.authService.activeUser$.subscribe(user => this.getTasks(user)))
      }

    }))

    this.tests = [{a:'aaa', b:'aab'}, {a:'bba', b:'bbb'}, {a:'cca', b:'ccb'}];
    // this.reportService.getTaskUpdates('eFpWYzxlU7PR70gi1Guq0688B9x1', [])
  }

  testAdd() {
    this.tests.push({a:'dda', b:'ddb'})
  }

  testRemove() {
    this.tests.splice(1,1)
    console.log("X", this.tests);
    
  }

  testModify() {
    // let upd = {a:'ffa', b:'ffb'};
    // for (let k in upd) {
    //   this.tests[1][k] = upd[k];
    // }

    [this.tests[1], this.tests[2]] = [this.tests[2], this.tests[1]]
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  getTasks_destructionOnChange(user: User) {
    this.user = user;
    if (user) {
      this.subs.push(this.reportService.onTaskChanged$(user.uid).subscribe(tasks => {
        this.tasks = tasks;
      }))
    } else {
      this.tasks = [];
    }
  }

  getTasks(user: User) {
    this.user = user;
    if (user) {
      this.reportService.getTaskUpdates(user.uid).then(result => {
        [this.tasks, this.taskUnsubFn] = result;
      })
    } else {
      if (this.taskUnsubFn) this.taskUnsubFn();
      this.tasks = [];
    }
  }


  ngOnDestroy() {
    console.log("destroy", );
    
    this.subs.forEach(sub => sub.unsubscribe())
    if (this.taskUnsubFn) this.taskUnsubFn();
  }

}
