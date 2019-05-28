import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription, Subject } from 'rxjs';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ConfigService } from '../services/config.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private cfgService: ConfigService
  ) { }

  ngOnInit() {
    this.subs.add(this.authService.onUserChanged$().subscribe(user => {
      this.user = user;
      this.ready = true;
    }))
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
    this.navigating = !this.navigating;
  }

  // monitor navigation, and show loading bar
  monitorNavigation() {
    this.subs.add(this.router.events.subscribe(event => {
      switch (true) {
        case event instanceof NavigationStart:
          
          this.navigating = true;
          console.log("set", this.navigating);
          break;
        
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError:
          // dont go so fast
          setTimeout(() => this.navigating = false, 200)
          console.log("set", this.navigating);
          break;
      }
    }))
  }


}
