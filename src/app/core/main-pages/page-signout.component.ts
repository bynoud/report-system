import { Component, OnInit } from "@angular/core";
import { AuthService } from '../services/auth.service';
import { FlashMessageService } from '../flash-message/flash-message.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-page-signout',
    template: `<app-loading></app-loading>`
    // template: `<p>Signout page</p>`
})
export class PageSignoutComponent implements OnInit {
    constructor(
        private router: Router,
        private authService: AuthService,
        private msgService: FlashMessageService
    ) {}

    ngOnInit() {
        this.authService.signOut().then(() => {
            this.router.navigate(["/"]);
            this.msgService.info("Successful Logged out", true)
        })
    }
}