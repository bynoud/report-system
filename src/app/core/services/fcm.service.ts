import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { FlashMessageService } from '../flash-message/flash-message.service';

@Injectable({providedIn: 'root'})
export class FCMService {

  currentMessage = new BehaviorSubject(null);
  subs = new Subscription();
  curTok = "";

  fs: firestore.Firestore;

  constructor(
    private afs: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging,
    private msgService: FlashMessageService
  ) {
    this.fs = afs.firestore;
    // this.angularFireMessaging.messaging.subscribe(
    //   (_messaging) => {
    //     _messaging.onMessage = _messaging.onMessage.bind(_messaging);
    //     _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    //   }
    // )
    // this.angularFireMessaging.tokenChanges.subscribe()
  }

  error(err: any) {
    this.msgService.error(err);
    console.error("X",err);
    // console.trace();
    return Promise.reject(err);
  }

  addFcmToken(uid: string) {
    console.log("get FCM token");
    
    this.subs.add(this.angularFireMessaging.requestToken.subscribe(
      async tok => {
        const sharedRef = this.fs.doc(`shared/${uid}/services/fcm`);
        const secretRef = this.fs.doc(`secrets/${uid}/services/fcm`);
        const shared = await sharedRef.get();
        const bw = this.fs.batch();
        if (!shared.exists) {
          console.log("need create fcm");
          bw.set(sharedRef, {tokens: true});
          bw.set(secretRef, {tokens: []});
        }
        if (this.curTok != '') {
          bw.update(secretRef, {
            tokens: firestore.FieldValue.arrayRemove(this.curTok)
          })
        }
        bw.update(secretRef, {
          tokens: firestore.FieldValue.arrayUnion(tok)
        })
        this.curTok = tok;
        return bw.commit();
      },
      err => {
        console.error(err)
        this.msgService.warn("The notification is denied. You can not get any inform from other memebrs")
      })
    )
  }

  removeFcmToken(uid: string) {
    console.log("remove FCM token", uid, this.curTok);
    this.subs.unsubscribe();
    return this.afs.doc(`secrets/${uid}/services/fcm`).update({
      tokens: firestore.FieldValue.arrayRemove(this.curTok)
    })
      .then(() => this.curTok = "")
      .catch(err => console.error("remove failed", err))
  }


  // /**
  //  * update token in firebase database
  //  * 
  //  * @param userId userId as a key 
  //  * @param token token as a value
  //  */
  // updateToken(userId, token) {
  //   // we can change this function to request our backend service
  //   this.angularFireAuth.authState.pipe(take(1)).subscribe(
  //     () => {
  //       // const data = {};
  //       // data[userId] = token
  //       // this.angularFireDB.object('fcmTokens/').update(data)
  //       this.afs.doc(`tmps/${userId}`).set({fcmTokens: token})
  //     })
  // }

  // // /**
  // //  * request permission for notification from firebase cloud messaging
  // //  * 
  // //  * @param userId userId
  // //  */
  // // requestPermission() {
  // //   return this.angularFireMessaging.requestToken.pipe(take(1)).toPromise()
  // // }

  /**
   * hook method when new notification received in foreground
   */
  onMessageRecieved() {
    console.log("on message called");
    
    return this.angularFireMessaging.messages
  }
}