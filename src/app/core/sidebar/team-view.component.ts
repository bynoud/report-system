import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { User, Team } from 'src/app/models/user';
import { Subscription, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-team-view',
    templateUrl: './team-view.component.html',
})
export class TeamViewComponent implements OnInit, OnDestroy {

    @Input() deep: number;
    @Input() user: User;
    activeUser: User;
    team: Team;
    loading$ = new BehaviorSubject<boolean>(true);
    subs = new Subscription();

    constructor(
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.getMyTeam();
        this.subs.add(this.authService.onUserChanged$()
            .subscribe(user => this.activeUser = user))
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }


    async getMyTeam() {
        this.team = await this.authService.getMyTeam(this.user, this.deep==0)
        this.loading$.next(false);
        console.log("XX", this.user, this.team);
      }

}