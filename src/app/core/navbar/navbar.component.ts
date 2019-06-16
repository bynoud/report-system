import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription, Subject } from 'rxjs';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { FCMService } from '../services/fcm.service';
import { FCFService } from '../services/fcf.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  user: User;
  ready = false;
  subs = new Subscription();
  navigating = false;
  notifPerm: NotificationPermission = 'granted';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fcmService: FCMService,
    private msgService: FlashMessageService,
    private cfgService: ConfigService
  ) { }

  ngOnInit() {
    this.subs.add(this.authService.onUserChanged$().subscribe(user => {
      this.user = user;
      this.ready = true;
    }))
    this.subs.add(this.fcmService.onPermissionChanged().subscribe(perm => this.notifPerm = perm))
    this.monitorNavigation();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onNewTask() {
    this.router.navigate(['/report/new', {id: this.user.uid, return: this.router.url}])
  }

  toggleSidebar() {
    this.cfgService.toogleSidebar = !this.cfgService.toogleSidebar;
  }

  // monitor navigation, and show loading bar
  monitorNavigation() {
    this.subs.add(this.router.events.subscribe(event => {
      switch (true) {
        case event instanceof NavigationStart:
          
          this.navigating = true;
          break;
        
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError:
          // dont go so fast
          setTimeout(() => this.navigating = false, 200)
          break;
      }
    }))
  }

  enableNotif() {
    this.fcmService.requestToken(this.user.uid)
  }

  warnNotifDenied() {
    this.msgService.warn("Notification had been Denied. Click icon on the left of address-bar to enable it")
  }

  // // testing
  // testSub: Subscription;
  // addFcmToken() {
  //   this.testSub = this.fcmService.onTokenChanged(this.user.uid)
  //     .subscribe(ok => console.log("token sub", ok))
  // }
  // removeFcmSub() {
  //   this.testSub.unsubscribe();
  // }

  // sendNotify() {
  //   console.log("start notify");
  //   this.fcfService.remindLateMembers(['gIEpVG4JkqS6f5nd5TPGEZp8nEh2', '3PsAxgmHOJaR4k4EapgaC6Gy7of1'])
  //     .then(res => console.log("done", res))
  // }


}
