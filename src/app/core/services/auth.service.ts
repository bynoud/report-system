import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { switchMap, first, map, mergeMap, catchError, takeLast, concat } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { auth } from 'firebase';

// this is also act as AuthGaurd

@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate {
  // user$: Observable<User>;
  private fs: firebase.firestore.Firestore;
  private _activeUser$ = new ReplaySubject<User>(1);  // only replay the last value
  
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private msgService: FlashMessageService
  ) {

    this.fs = this.afs.firestore;
    this.afAuth.authState.subscribe(fbUser => {
        console.log("AUTH FB user", fbUser);
        if (fbUser) {
          this.fs.doc(`users/${fbUser.uid}`).get()
            .then(user => {
              this._activeUser$.next(<User>user.data())
            })
            .catch(err => {
              this._activeUser$.next(null)
              this.error(err)
            })
        } else {
          this._activeUser$.next(null)
        }
      })
    
    this.afAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL);
  }

  get activeUser$() {
    return this._activeUser$
  }

  error(err: any) {
    this.msgService.error(err);
    console.error(err);
    return Promise.resolve(null);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.activeUser$.pipe(
      map(user => {
        if (user) {
          return true
        } else {
          this.router.navigate(['/'])
          this.msgService.error("Login is required")
        }
        return false
      })
    )
    // return this.afAuth.authState.pipe(
    //   map(user => {
    //     if (user) {
    //       return true
    //     } else {
    //       this.router.navigate(['/'])
    //       this.msgService.error("Login is required")
    //     }
    //     return false
    //   })
    // )
  }

  // get activeUserID$(): Observable<string> {
  //   return this.afAuth.authState.pipe(
  //     map(user => user.uid)
  //   );
  // }

  // get activeUser(): User {
  //   // return this.user$.pipe(first());
  //   return this.user
  // }

  // WARN: This one leak "getUser$()" subcription, if the user is a lifetime member (ex: service)
  // getActiveUser$(deb: string): Observable<User> {
  //   return this.afAuth.authState.pipe(
  //     switchMap(fbUser => {
  //       console.log("auth changed", fbUser);
  //       if (fbUser) return this.getUser$(fbUser.uid, `from active XX -${deb}-`).pipe(catchError(err => this.error("active getuser "+err)))
  //       else return of(null)
  //     }),
  //     catchError(err => this.error("activeuser "+err))
  //   )
  // }

  // getActiveUser(): Promise<firebase.User> { return this.activeUser$.toPromise(); }

  getUsers$(): Observable<User[]> {
    return this.afs.collection<User>('users').valueChanges().pipe(
      catchError(err => this.error("getusers "+err))
    )
  }

  // getUsers(): Promise<User[]> {
  //   return this.afs.collection<User>('users').valueChanges().toPromise();
  // }

  getUser$(uid: string, deb: string): Observable<User> {
    return this.afs.doc<User>(`users/${uid}`).valueChanges().pipe(
      catchError(err => this.error(`getuserXX [${deb}]`+err))
    )
  }

  // getUser(uid: string): Promise<User> {
  //   console.log("getuser", uid);
    
  //   return this.afs.doc<User>(`users/${uid}`).valueChanges().toPromise();
  // }

  // googleSignIn() {
  //   this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
  //   return this.oAuthLogin(provider);
  // }

  emailSignUp(displayName: string, email: string, photoURL: string, managerID: string, password: string): Promise<void> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then( uathInfo => {
        var user: User = {displayName, email, photoURL, managerID,
          uid: uathInfo.user.uid, role: "user"}
        return this.createUser(user);
      })
      .catch(err => this.error(err))
  }

  private createUser(user: User): Promise<void> {
    if (!user.managerID) user.managerID = "";
    return this.afs.doc<User>(`users/${user.uid}`).set(user).catch(err => this.error("createuser"+err))
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password).catch(err => this.error(err))
  }

  // private async oAuthLogin(provider) {
  //   const credential = await this.afAuth.auth.signInWithPopup(provider);
  //   return this.updateUserData(credential.user);
  // }

  private updateUserData(user: User) {
    return this.afs.doc<User>(`users/${user.uid}`).set(user, { merge: true }).catch(err => this.error(err))
  }

  signOut() {
    return this.afAuth.auth.signOut().catch(err => this.error(err))
    // return this.router.navigate(['/']);
  }

}
