import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { User, Team } from 'src/app/models/user';
import { Subscription } from 'rxjs';
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
        // get members
        console.log("XX", this.user);
        
        let team = new Team(this.user);
        team.addMembers(await this.authService.getUserWith('managerID', '==', this.user.uid));
        
        // If this is not root view, then the hierachy is populated by upper view
        // If this is root view, and I have members, then I'm the top of the tree
        // If this is root view, and I don't have any members
        // + show my peers
        // + show my manager
        if (this.deep==0 && team.size == 0) {
            if (this.user.managerID) {
                team.upLevel(await this.authService.getUser$(this.user.managerID))
            } else {
                team.upLevel(null)
            }
            team.addMembers(await
                this.authService.getUserWith('managerID', '==', this.user.managerID)
                    .then(users => users.filter(u => u.uid != this.user.uid))
            );
        }

        this.team = team;
      }

}