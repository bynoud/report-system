import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { User, Team } from 'src/app/models/user';
import { Subscription, BehaviorSubject, of, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { switchMap, switchMapTo, first, tap } from 'rxjs/operators';

@Component({
    selector: 'app-team-view',
    templateUrl: './team-view.component.html',
})
export class TeamViewComponent implements OnInit, OnDestroy {

    @Input() deep: number;
    @Input() user: User;
    @Input() activeUser: User;
    team: Team;
    loading$ = new BehaviorSubject<boolean>(true);
    subs = new Subscription();
    teamSubs: Subscription;

    constructor(
        private authService: AuthService
    ) {}

    ngOnInit() {
        if (this.deep == undefined) this.deep = 0
        console.warn("teamview init", this.deep, this.user);

        // For the root View, if active User info updated, we need to reset Team view
        let obs: Observable<User>
        if (this.deep == 0) {
            obs = this.authService.onUserInfoUpdated$()
                .pipe(
                    tap(user => {
                        console.log("teamview user update", user);
                        
                        this.user = user
                        this.activeUser = user
                    })
                )
        } else {
            obs = of(this.user)
        }
        this.teamSubs = obs.pipe(
            switchMap(user => {
                console.log("get my team", user, this.deep);
                
                if (user) return this.authService.getMyTeam(user, this.deep > 0)
                else return of(null)
            })
        ).subscribe(team => {
            console.log("teamview", team);
            this.team = team         
        })
    }

    ngOnDestroy() {
        if (!this.teamSubs.closed) this.teamSubs.unsubscribe();
    }


    // async getMyTeam() {
    //     this.team = await this.authService.getMyTeam(this.user, this.deep==0)
    //     this.loading$.next(false);
    //     console.log("XX", this.user, this.team);
    //   }

}