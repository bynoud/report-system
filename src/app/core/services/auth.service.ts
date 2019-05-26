import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of, Subject, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { switchMap, first, map, mergeMap, catchError, takeLast, concat, take } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { auth, firestore } from 'firebase';
import { serverTime } from 'src/app/models/reports';
import { AngularFireFunctions } from '@angular/fire/functions';

// this is also act as AuthGaurd

@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate {
  // user$: Observable<User>;
  private fs: firestore.Firestore;

  private _authSub: Subscription;
  private _activeUser$ = new ReplaySubject<User>(1);  // only replay the last value
  private _activeFBUser$ = new ReplaySubject<firebase.User>(1);
  private _authUserChanged$ = new Subject<boolean>();

  private _users$: {[s: string]: User} = {};

  private deb: {curFn: ""};
  
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fns: AngularFireFunctions,
    private router: Router,
    private msgService: FlashMessageService
  ) {

    this.fs = this.afs.firestore;;
    // this.fns.functions.useFunctionsEmulator('http://localhost:5001');
    this.subAuthState();
    this.afAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL);
  }

  private subAuthState() {
    this._authSub = this.afAuth.authState.subscribe(fbUser => {
      console.log("AUTH FB user", fbUser);
      if (fbUser) {
        // if (!fbUser.emailVerified) {
        //   this.userChange(null, fbUser);
        // } else {
        this.fs.doc(`users/${fbUser.uid}`).get()
          .then(user => this.userChange(<User>user.data(), fbUser))
          .catch(err => {
            this.userChange(null, fbUser)
            this.error(err)
          })
      } else {
        this.userChange(null, null)
      }
    })
  }

  private unsubAuthState() {
    this._authSub.unsubscribe();
  }

  private userChange(user: User, fbUser: firebase.User) {
    this._activeUser$.next(user)
    this._authUserChanged$.next(user ? true : false);
    this._activeFBUser$.next(fbUser)
  }

  onUserChanged$() {
    return this._activeUser$;
  }

  onLoginChanged$() {
    return this._activeUser$.pipe(map(user => user!=null))
  }

  waitLoginChanged$() {
    return this._authUserChanged$.pipe(take(1));
  }

  get activeUser$() {
    return this._activeUser$.pipe(first())
  }

  error(err: any) {
    this.msgService.error(err);
    console.error("X",err);
    // console.trace();
    return Promise.reject(err);
  }

  raise(err: any) {
    this.msgService.error(err);
    console.error("errpromise",err);
    return err;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._activeFBUser$.pipe(
      take(1),
      map(user => {
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

  private createUser(userCred: auth.UserCredential, opts: {[s:string]: string} = {}): Promise<void> {
    if (!userCred.additionalUserInfo.isNewUser) return;
    console.log("create a new user");
    
    return this.fns.functions.httpsCallable('createUser')({
      managerID: "",
      ...opts
    })
      .then(res => console.log('created functions', res))
      .catch(err => this.error(err))
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


  getUsers$(): Promise<User[]> {
    return this.fs.collection('users').get()
      .then(snaps => {
        return snaps.docs.map(userSS => <User>userSS.data() )
      })
      .catch(err => this.error(err))
  }

  getUser$(uid: string, deb: string = ""): Promise<User> {
    if (this._users$[uid]) {
      return Promise.resolve(this._users$[uid]);
    } else {
      return this.fs.doc(`users/${uid}`).get()
        .then(snaps => {
          this._users$[uid] = <User>snaps.data();
          return this._users$[uid];
        })
        .catch(err => this.error(err))
    }
  }

  getActiveUser$() {
    return this._activeUser$.pipe(first()).toPromise()
  }


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
    console.log("start");
    
    return this.afAuth.auth.signInWithPopup(provider).then(cred => {
      console.log("finish popup");
      
      return this.createUser(cred);
    })
    .then(() => {
      this.subAuthState()
    })
    // .catch(err => {throw this.raise(err)})
  }

  signOut() {
    return this.afAuth.auth.signOut()
      .then(() => {
        return this.waitLoginChanged$().toPromise();
      })
      .catch(err => this.error(err))
    // return this.router.navigate(['/']);
  }

}
