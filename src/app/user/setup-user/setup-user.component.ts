import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { FCFService } from 'src/app/core/services/fcf.service';
import { Router } from '@angular/router';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { AngularFirestore } from '@angular/fire/firestore';

const STATES = [
  'inputEmail',
  'selectManager',
];

@Component({
  selector: 'app-setup-user',
  templateUrl: './setup-user.component.html',
  styleUrls: ['./setup-user.component.scss']
})
export class SetupUserComponent implements OnInit {

  user: User;
  state: string = STATES[0];
  stateLast = false;
  stateFirst = true;
  managers: User[];

  loading$ = new BehaviorSubject<boolean>(true);
  loadingManagers$ = new BehaviorSubject<boolean>(true);

  emailDomain = "marvell.com";
  model = {companyEmail: "", managerID: ""};
  
  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private authService: AuthService,
    private msgService: FlashMessageService
  ) { }

  ngOnInit() {
    this.getUserManagers();
  }

  async getUserManagers() {
    this.user = await this.authService.getActiveUser$();
    this.model.managerID = this.user.managerID;
    this.model.companyEmail = this.user.companyEmail || "";
    this.loading$.next(false);
    this.authService.getUsersWith('role', '==', 'm').subscribe(users => {
      this.managers = users.filter(u => u.uid != this.user.uid);
      this.loadingManagers$.next(false);
    })
  }

  selectManager(uid: string) {
    if (uid == this.model.managerID) this.model.managerID = "";
    else this.model.managerID = uid;
  }

  stateNext() { this.stateMove(true) }
  stateBack() { this.stateMove(false) }

  private stateMove(next: boolean) {
    let ind = STATES.indexOf(this.state);
    ind = next ? ind+1 : ind-1;
    this.state = STATES[ind];
    this.stateFirst = ind == 0;
    this.stateLast = ind == STATES.length-1;
    console.log(next, ind, STATES, this.state, this.stateFirst, this.stateLast);
    
  }

  async submitForm() {
    this.loading$.next(true);
    if (this.user.managerID == this.model.managerID) {
      this.model.managerID = "";
    }
    let msgs = await this.authService.updateUser({
      companyEmail: this.model.companyEmail,
      managerID: this.user.managerID == this.model.managerID ? "" : this.model.managerID
    });
    if (msgs.length > 0) {
      this.msgService.info("Account updated successfully", true)
      // need to wait until the change take effect
      await this.afs.firestore.doc(`users/${this.user.uid}`).get({source: 'server'})
        .then(user => {console.log("setupuser", user.data())})

    } else {
      this.msgService.warn("No update was made to account", true);
    }
    this.router.navigate(['/report']);
  }

}
