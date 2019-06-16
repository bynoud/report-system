import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of, Subject, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { switchMap, first, map, mergeMap, catchError, takeLast, concat, take } from 'rxjs/operators';
import { User, Team } from 'src/app/models/user';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { auth, firestore } from 'firebase';
import { serverTime } from 'src/app/models/reports';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FCFService } from './fcf.service';
import { FCMService } from './fcm.service';
import { NgForage } from 'ngforage';

// this is also act as AuthGaurd

@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate {
  // user$: Observable<User>;
  private fs: firestore.Firestore;

  private _authSub: Subscription;
  private _activeUser$ = new ReplaySubject<User>(1);  // only replay the last value
  // private _activeFBUser$ = new ReplaySubject<firebase.User>(1);
  private _authUserChanged$ = new Subject<boolean>();

  private _users$: {[s: string]: User} = {};

  private deb: {curFn: ""};
  
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fcf: FCFService,
    private ngForage: NgForage,
    private router: Router,
    private msgService: FlashMessageService,
    private fcmService: FCMService
  ) {

    this.fs = this.afs.firestore;;
    this.subAuthState();
    this.afAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL);
  }

  private subAuthState() {
    this._authSub = this.afAuth.authState.subscribe(fbUser => {
      // console.log("AUTH FB user", fbUser);
      if (fbUser) {
        // if (!fbUser.emailVerified) {
        //   this.userChange(null, fbUser);
        // } else {
        this.fs.doc(`users/${fbUser.uid}`).get()
          .then(user => this.userChange(<User>user.data()))
          .catch(err => {
            this.error(err)
            this.userChange(null)
          })
      } else {
        this.userChange(null)
      }
    })
  }

  private unsubAuthState() {
    this._authSub.unsubscribe();
  }

  private userChange(user: User) {
    console.warn("user changed", user);
    this._activeUser$.next(user)
    // this._activeFBUser$.next(fbUser);
    this._authUserChanged$.next(user ? true : false);
  }
  


  onUserChanged$() {
    return this._activeUser$.asObservable();
  }

  onLoginChanged$() {
    return this._activeUser$.pipe(map(user => user!=null))
  }

  waitLoginChanged$() {
    return this._authUserChanged$.pipe(take(1)).toPromise();
  }

  get activeUser$() {
    return this._activeUser$.pipe(first())
  }

  error(err: any) {
    this.msgService.error(err);
    console.error(err);
    // console.trace();
    return null;
  }

  raise(err: any) {
    this.msgService.error(err);
    console.error(err);
    return err;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._activeUser$.pipe(
      take(1),
      map(user => {
        // console.warn("can active", user);
        
        if (user == null) {
          this.router.navigate(['/'])
          this.msgService.error("Login is required", true)
        } else {
          return true;
          // if (user.emailVerified) {
          //   return true;
          // } else  {
          //   this.msgService.error(`Email ${user.email} is registered, but has not been verified.`);
          //   this.router.navigate(['./activate', user.email]);
          // }
        }
        return false
      })
    )
  }

  private async createUser(userCred: auth.UserCredential, opts: {[s:string]: string} = {}) {
    if (userCred.additionalUserInfo.isNewUser) {
      console.log("create a new user");
      await this.fcf.createUser({managerID: "", ...opts})
        .catch(err => this.error(err))
    }

    // this.fcmService.addFcmToken(userCred.user.uid)
    return userCred;
  }
  
  private createUserLocal(user: firebase.User, opts: {[s:string]: string} = {}): Promise<void> {
    const vals = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      managerID: "",
      role: "user",
      createdAt: serverTime(),
      ...opts};
    return this.afs.doc(`users/${user.uid}`).set(vals).catch(err => this.error(err))
  }


  getUserWith(field: string, op: firestore.WhereFilterOp, value: any) {
    // console.log("getuserswith", field, op, value);
    
    return this.fs.collection('users').where(field, op, value).get()
      .then(snaps => snaps.docs.map(doc => <User>doc.data()))
  }

  // async getPeerMembers() {
  //   const user = await this.getActiveUser$();
  //   return this.queryUserWith([['managerID', '==', user.managerID]])
  // }


  // async getMyTeam() {
  //   const user = await this.getActiveUser$();
  //   let myTeam: Team;
  //   if (user.managerID) {
  //     const manager = await this.getUser$(user.managerID);
  //     myTeam = new Team(manager)
  //   } else {
  //     myTeam = new Team(null)
  //   }

  //   myTeam.addMembers(await this.getUserWith('managerID', '==', user.managerID))
  //   myTeam.addSubteam(new Team(user, await this.getUserWith('managerID', '==', user.uid)))
  //   return myTeam;
  // }
  async getMyTeam(user: User, upTeamAtBottom: boolean) {
    // get members
    let team = new Team(user);
    team.addMembers(await this.getUserWith('managerID', '==', user.uid));
    // console.log("getteam", user, team);
    
    if (upTeamAtBottom && team.size == 0) {
        if (user.managerID) {
            team.upLevel(await this.getUser$(user.managerID))
        } else {
            team.upLevel(null)
        }
        team.addMembers(await
            this.getUserWith('managerID', '==', user.managerID)
                .then(users => users.filter(u => u.uid != user.uid))
        );
    }
    return team;
  }

  
  getUser$(uid: string, deb: string = ""): Promise<User> {
    return this.fs.doc(`users/${uid}`).get()
      .then(snap => <User>snap.data())
      .catch(err => this.error(err))
    // if (this._users$[uid]) {
    //   return Promise.resolve(this._users$[uid]);
    // } else {
    //   return this.fs.doc(`users/${uid}`).get()
    //     .then(snaps => {
    //       this._users$[uid] = <User>snaps.data();
    //       return this._users$[uid];
    //     })
    //     .catch(err => this.error(err))
    // }
  }


  getActiveUser$() {
    return this._activeUser$.pipe(first()).toPromise()
  }

  updateUser(update: {[s:string]: any}) {
    const pros: Promise<any>[] = [];
    const items: string[] = [];
    for (const k in update) {
      if (!update[k]) continue;
      switch(k) {
        case 'companyEmail':
          pros.push(this.fcf.setCompanyEmail(update[k]));
          items.push(k);
          break;
        case 'managerID':
          pros.push(this.fcf.setManager(update[k]));
          items.push(k);
          break;
        case 'role':
          if (update.userID && update.level!=null) {
            pros.push(this.fcf.setRole(update.userID, update.role, update.level));
            items.push(k);
          }
          break;
      }
    }
    return Promise.all(pros).then(() => items)
      // -> just dont cache user data. Not so expensive to fetch it again
      // .then(() => {
      //   // remove cached user data on success
      // })
      .catch(err => this.error(err))
  }

  // async getUsersSame(field: string) {
  //   const user = await this.getActiveUser$();
  //   console.log('user', user, field, user[field]);
    
  //   if (user && user[field] != undefined) {
  //     const snaps = await this.fs.collection(`users`).where(field, '==', user[field]).get();
  //     return snaps.docs.map(doc => <User>doc.data()).filter(u => u.uid != user.uid);
  //   } else {
  //     return [];
  //   }
  // }


  emailSignUp(displayName: string, email: string, photoURL: string, managerID: string, password: string): Promise<void> {
    this.unsubAuthState();
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then( cred => {
        return this.createUser(cred, {displayName, photoURL, managerID, email});
      })
      .then(() => this.subAuthState())
      // .catch(err => {throw this.raise(err)})
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      // .catch(err => {throw this.raise(err)})
  }

  googleLogin() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider)
  }

  facebookLogin() {
    const provider = new auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider: auth.AuthProvider) {
    this.unsubAuthState();
    // console.log("start");
    let userCred: auth.UserCredential;
    
    return this.afAuth.auth.signInWithPopup(provider).then(cred => {
      // console.log("finish popup");
      userCred = cred;
      return this.createUser(cred);
    })
    .then(() => this.subAuthState())
    .then(() => this.waitLoginChanged$())
    .then(() => userCred)
    // .catch(err => {throw this.raise(err)})
  }

  async signOut() {
    const uid = await this.getActiveUser$().then(user => user ? user.uid : "");
    if (!uid) return;
    // await this.fcmService.removeFcmToken(uid);
    // best effort try. If failed (ex: offline logout or some weird firebase error)
    // then SWorker will help to clean it later
    this.fcmService.removeToken(uid)
    return this.afAuth.auth.signOut()
      .then(() => this.waitLoginChanged$())
      .catch(err => this.error(err))
    // return this.router.navigate(['/']);
  }
}

