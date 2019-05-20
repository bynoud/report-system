import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { Observable, of, Subject } from 'rxjs';
import { switchMap, first, map, mergeMap } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';
import { auth } from 'firebase';

// this is also act as AuthGaurd

@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate {
  // user$: Observable<User>;
  
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private msgService: FlashMessageService
  ) {
    
    // this.user$ = this.afAuth.authState.pipe(
    //   // switchMap: if authState change during fetch user infos, cancel and start a new fetch
    //   //switchMap(user => {
    //   mergeMap(user => {
    //     console.log("authStat changed", user);
        
    //     if (user) {
    //       return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
    //     } else {
    //       return of(null);
    //     }
    //   })
    // );
    this.afAuth.auth.setPersistence(auth.Auth.Persistence.LOCAL);
    
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.afAuth.authState.pipe(
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

  get activeUser$(): Observable<User> {
    return this.afAuth.authState.pipe(
      mergeMap(fbUser => {
        console.log("auth changed", fbUser);
        if (fbUser) return this.getUser$(fbUser.uid)
        else return of(null)
      })
    )
  }

  // getActiveUser(): Promise<firebase.User> { return this.activeUser$.toPromise(); }

  getUsers$(): Observable<User[]> {
    return this.afs.collection<User>('users').valueChanges();
  }

  // getUsers(): Promise<User[]> {
  //   return this.afs.collection<User>('users').valueChanges().toPromise();
  // }

  getUser$(uid: string): Observable<User> {
    return this.afs.doc<User>(`users/${uid}`).valueChanges();
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
  }

  private createUser(user: User): Promise<void> {
    if (!user.managerID) user.managerID = "";
    return this.afs.doc<User>(`users/${user.uid}`).set(user);
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  // private async oAuthLogin(provider) {
  //   const credential = await this.afAuth.auth.signInWithPopup(provider);
  //   return this.updateUserData(credential.user);
  // }

  private updateUserData(user: User) {
    return this.afs.doc<User>(`users/${user.uid}`).set(user, { merge: true });
  }

  signOut() {
    this.afAuth.auth.signOut();
    return this.router.navigate(['/']);
  }
}
