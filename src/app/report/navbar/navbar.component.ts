import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User;
  otherUsers: User[] = [];
  subs: Subscription[] = [];
  loading$: BehaviorSubject<boolean>[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subs.push(this.authService.activeUser$.subscribe(user => {
      this.user = user;
      this.authService.getUsers$().then( users => {
        this.otherUsers = users.filter(user => user.uid != this.user.uid);
      });
    }));

  }

  onLogout() {
    console.log("to log out");
    
    this.authService.signOut().then(() => {
      this.router.navigate(["/"])
    })
  }

  ngOnDestroy() {
    console.log("destroy");
    this.subs.forEach(sub => sub.unsubscribe())
  }


}
