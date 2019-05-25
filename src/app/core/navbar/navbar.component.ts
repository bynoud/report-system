import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { Router } from '@angular/router';
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


}
