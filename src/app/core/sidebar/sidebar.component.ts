import { Component, Input } from "@angular/core";
import { User, Team } from 'src/app/models/user';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FlashMessageService } from '../flash-message/flash-message.service';
import { ConfigService } from '../services/config.service';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

    user: User;
    // otherUsers: User[] = [];
    // myTeam: Team;
    subs = new Subscription();
    loadingUsers$ = new BehaviorSubject<boolean>(false);

    constructor(
        private router: Router,
        private authService: AuthService,
        private msgservice: FlashMessageService,
        public cfgService: ConfigService
    ) { }

    ngOnInit() {
        this.subs.add(this.authService.onUserChanged$().subscribe(user => {
            this.user = user;
            // if (user) {
            //     this.loadingUsers$.next(true);
            //     // this.authService.getUsers$().then( users => {
            //     //     this.otherUsers = users.filter(user => user.uid != this.user.uid);
            //     //     this.loadingUsers$.next(false);
            //     // });
            //     this.authService.getMyTeam().then(team => {
            //         console.log("team", team);
                    
            //         this.myTeam = team;
            //         this.loadingUsers$.next(false);
            //     })
            // } else {
            //     this.otherUsers = [];
            // }
        }));

    }

    ngOnDestroy() {
        console.log("destroy");
        // this.subs.unsubscribe()
    }

    onLogout() {
        console.log("to log out");
        // prevent permission denied error, when the logout is fast & navigate is not active then the page is not destroyed yet
        this.router.navigate(['/signout']);
        // this.authService.signOut().then(() => {
        // this.router.navigate(["/"]);
        // this.msgservice.info("Successful Logged out", true)
        // })
    }

    onNewTask() {
        this.router.navigate(['/report/new', {id: this.user.uid, return: this.router.url}])
    }

}