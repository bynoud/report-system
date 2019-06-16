import { Injectable, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo, map, mergeMap, catchError, mapTo, filter, tap } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject, Subscription, of, throwError, Observable, ReplaySubject } from 'rxjs'
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { FlashMessageService } from '../flash-message/flash-message.service';
import { User } from 'src/app/models/user';
import { AuthService } from './auth.service';
import { FCFService } from './fcf.service';
import { FcmToken, FcmData } from 'src/app/models/fcm';


@Injectable({providedIn: 'root'})
export class FCMService {

  // currentMessage = new BehaviorSubject(null);
  // subs = new Subscription();
  // curTok = "";

  userID = "";
  fs: firestore.Firestore;
  tokenSub: Subscription;

  private notifPerm$ = new ReplaySubject<NotificationPermission>(1);

  constructor(
    // private afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private afMessaging: AngularFireMessaging,
    private msgService: FlashMessageService,
  ) {
    this.fs = afStore.firestore;
    this.notifPerm$.next(Notification.permission);
    // this.afAuth.authState.subscribe(fbUser => {
    //   this.userID = fbUser ? fbUser.uid : ""
    // })
  }


  error(err: any) {
    this.msgService.error(err);
    console.error("X",err);
    // console.trace();
    return Promise.reject(err);
  }


  // FCM tokens is added when a token refresh event triggered
  // obsoleted FCM token remove is handled by cloud functions. When a push notification execute, token which failed to received will be removed.

  // Data structure
  //  secrets/  <col>
  //    <userID>          <doc>
  //      fcmTokens/      <col>
  //        <tokenID>     <doc>
  //          userID: string
  //          lastUsed: Date
  //          
  private async sendTokenToServer(uid: string, tok: string) {
    console.log("adding token:", tok);
    
    if (tok) {
      // const docRef = this.fs.collection(`secrets/${uid}/fcmTokens`).doc()
      // await docRef.set({
      //   uid: docRef.id, userID: uid, token: tok,
      //   lastUsed: <firestore.Timestamp>firestore.FieldValue.serverTimestamp()
      // })
      await this.afStore.doc<FcmToken>(`secrets/${uid}/fcmTokens/${tok}`).set({
          uid: tok, userID: uid, token: tok,
          lastUsed: <firestore.Timestamp>firestore.FieldValue.serverTimestamp()
        })
      return tok;
    }
    return "";
  }

  private requestPermission() {
    return this.afMessaging.requestPermission.pipe(
      map(() => {
        
        return true
      }),
      catchError(err => {
        console.error(err)
        this.msgService.warn("The notification is denied. You can not get any inform from other members")
        return of(false)
      }),
      tap(() => {
        console.warn("tap", Notification.permission);
        
        this.notifPerm$.next(Notification.permission)
      })
    )
  }

  onPermissionChanged() {
    return this.notifPerm$.asObservable();
  }

  requestToken(uid: string) {
    console.log("get FCM token");
    this.userID = uid;
    this.tokenSub = this.requestPermission().pipe(
      mergeMap(ok => ok ? this.afMessaging.tokenChanges : of("")),
      mergeMap(tok => this.sendTokenToServer(uid, tok)),
      catchError(err => {
        console.error(err)
        this.msgService.error("Technical difficuties. Try again later")
        return of("")
      })
    ).subscribe();

    
  }

  async removeToken(userID: string, tokenID: string = "") {
    if (!tokenID) {
      tokenID = await this.afMessaging.getToken.toPromise()
      console.warn("get token", tokenID);
    }
    if (this.tokenSub && !this.tokenSub.closed) this.tokenSub.unsubscribe();
    if (!tokenID) return;
    await this.afMessaging.deleteToken(tokenID)
    return this.afStore.doc(`secrets/${userID}/fcmTokens/${tokenID}`).delete()
  }



  /**
   * hook method when new notification received in foreground
   */
  onDataRecieved() {
    console.log("on message called");
    
    return this.afMessaging.messages.pipe(
      map(msg => <FcmData>msg['data']),
      filter(data => this.checkFcmToken(data)),
    )
  }

  private checkFcmToken(data: FcmData) {
    // if current user is different, ask server to remove this. I know it's not secured, but I don't find any better way for now...
    console.log("checking token", this.userID, data);
    if (!this.userID || !data || (data.userID != this.userID)) {
      // this.fcfService.removeFcmToken(data.userID, this.curTok)
      this.removeToken(data.userID, data.uid)
      return false;
    }
    return true;
  }

}