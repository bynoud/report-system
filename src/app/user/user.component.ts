import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
}

@Component({
  selector: 'app-user-landing',
  template: '<app-loading></app-loading>'
})
export class UserLandingComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.getActiveUser$().then(user => {
      console.log("user redirect", user);
      
      if (user) this.router.navigate(['/report']);
      else this.router.navigate(['/user/login'])
    })
  }
}