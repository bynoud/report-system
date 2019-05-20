import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { AuthService } from '../services/firebase/auth.service';

@Component({
    selector: "app-page-main",
    template: "<p>Loading...</p>",
    styles: [],
})
export class PageMainComponent implements OnInit {

    constructor(
        private router: Router,
        private authService: AuthService,
      ) {}

      ngOnInit() {
        this.authService.activeUser$.subscribe(user => {
          console.log("app to redirect", user);
          if (user) this.router.navigate(['/report'])
          else this.router.navigate(['/user'])
        })
      }
    
    
}
