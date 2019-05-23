import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: "app-page-main",
    template: "<p>page main Loading...</p>",
    styles: [],
})
export class PageMainComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.subs.push(this.authService.onLoginChanged$().subscribe(user => {
      console.log("app to redirect", user);
      if (user) this.router.navigate(['/report'])
      else this.router.navigate(['/user'])
    }))
  }
    
  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }
}
