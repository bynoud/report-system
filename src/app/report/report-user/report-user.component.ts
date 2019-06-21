import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task, StatusList } from 'src/app/models/reports';
import { ReportService } from '../report.service';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.css']
})
export class ReportUserComponent implements OnInit, OnDestroy {
  ready = false;

  user: User;
  tasks: Task[];
  subParams: Subscription;
  subTasks: Subscription;
  taskUnsubFn: () => void;

  allowModify: boolean;
  isDirectManager: boolean;
  isActiveUser: boolean;

  tests: any[] = [];
  tests$ = new Subject<{a:string,b:string}[]>();
  
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subParams = this.route.params.subscribe( params => {
      // console.warn("route param changed", params);
      this.getTasks(params['id'])
    })

    // this.tests = [{a:'aaa', b:'aab'}, {a:'bba', b:'bbb'}, {a:'cca', b:'ccb'}];
    // setTimeout(()=>this.tests$.next(this.tests), 3000);
  }

  testAdd() {
    // this.tests.push({a:'dda', b:'ddb'})
    let t = [{a:'aaa', b:'aab'}, {a:'bba', b:'bbb'}, {a:'cca', b:'ccb'}, {a:'dda', b:'ddb'}];
    this.tests$.next(t)
  }

  testRemove() {
    this.tests.splice(1,1)
    console.log("X", this.tests);
    this.tests$.next(this.tests);
  }

  testModify() {
    // let upd = {a:'ffa', b:'ffb'};
    // for (let k in upd) {
    //   this.tests[1][k] = upd[k];
    // }

    [this.tests[1], this.tests[2]] = [this.tests[2], this.tests[1]]
    this.tests$.next(this.tests);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  getTasks_destructionOnChange(user: User) {
    this.user = user;
    if (user) {
      this.subTasks = this.reportService.onTaskChanged$(user.uid).subscribe(tasks => {
        this.tasks = tasks;
      })
    } else {
      this.tasks = [];
    }
  }

  async getTasks(userID: string) {
    this.ready = false;
    this.tasks = [];

    if (this.subTasks && !this.subTasks.closed) {
      // console.warn("unsub tasks");
      
      this.subTasks.unsubscribe();
    }

    let actUser = await this.authService.getActiveUser$();
    let user = userID ? await this.authService.getUser$(userID) : actUser;

    this.isActiveUser = user.uid == actUser.uid;
    this.isDirectManager = user.managerID == actUser.uid;
    this.allowModify = this.isActiveUser || this.isDirectManager;
    this.user = user;

    if (user) {
      this.subTasks = this.reportService.getTaskUpdates(user.uid, this.tasks).subscribe(() => this.ready = true);
    }
  }


  ngOnDestroy() {
    // console.log("destroy", this.taskUnsubFn);
    
    this.subParams.unsubscribe();
    this.subTasks.unsubscribe();
  }

}
