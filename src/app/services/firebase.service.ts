// import { Injectable } from '@angular/core';
// import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
// import { User } from '../models/user';
// import { map } from 'rxjs/operators';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseService {

//   constructor(private db: AngularFirestore) { }

//   createUser(user: User){
//     return this.db.collection('users').add({
//       name: user.name,
//       nameToSearch: user.name.toLowerCase(),
//       email: user.email,
//       // age: parseInt(value.age),
//       avatar: user.avatar,
//       managerID: user.managerID,
//     });
//   }

//   fromFirebase(payload) {
//     var data = payload.data();
//     return new User(data.name, data.email, data.avatar, data.manageID, data.id);
//   }

//   fromUser(user: User): 
  
  
//   getAvatars(){
//     return this.db.collection('/avatar').valueChanges()
//   }

//   getUser(userKey): Observable<User> {
//     return this.db.collection('users').doc(userKey).snapshotChanges().pipe(
//       map(value => {
//         return this.fromFirebase(value.payload);
//       })
//     )
//   }

//   updateUser(userKey, value: User){
//     // value.nameToSearch = value.name.toLowerCase();
//     return this.db.collection('users').doc(userKey).set(value);
//   }

//   deleteUser(userKey){
//     return this.db.collection('users').doc(userKey).delete();
//   }

//   getUsers(): Observable<Array<User>> {
//     return this.db.collection('users').snapshotChanges().pipe(
//       map(values => {
//         var r: Array<User> = [];
//         values.forEach(item => r.push(this.fromFirebase(item.payload)));
//         return r;
//       })
//     )
//   }

//   // searchUsers(searchValue){
//   //   return this.db.collection('users',ref => ref.where('nameToSearch', '>=', searchValue)
//   //     .where('nameToSearch', '<=', searchValue + '\uf8ff'))
//   //     .snapshotChanges()
//   // }

//   // searchUsersByAge(value){
//   //   return this.db.collection('users',ref => ref.orderBy('age').startAt(value)).snapshotChanges();
//   // }

// }
