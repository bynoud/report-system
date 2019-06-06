
/*
  interface firebase.UserInfo {
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
    // The user's unique ID.
    uid: string;
  }
*/

export interface User {
  createdAt: firebase.firestore.Timestamp,
  role: string,
  level: number,
  email: string,
  displayName: string,
  photoURL: string,
  uid: string,
  managerID: string,
  companyEmail?: string,
}
export class Team {
  private _leader: User;
  private _mems: Team[];

  constructor(user: User = null, mems: Team[] = []) {
    this._leader = user;
    this._mems = mems;
  }

  setLeader(user: User) { this._leader = user }
  get leader() { return this._leader }

  get size() { return this._mems.length }

  // getSubTeam(leader: User | string): Team {
  //   const leaderID = (typeof(leader) == 'string') ? leader : leader.uid;
  //   const sub = this._mems.filter(mem => (mem instanceof Team) && mem.leader.uid == leaderID)
  //   if (sub.length == 0) return null;
  //   else return <Team>sub[0];
  // }
  getMember(user: User | string) {
    const userID = (typeof(user) == 'string') ? user : user.uid;
    return this._mems.find(mem => mem._leader.uid == userID)
  }

  get members(): Team[] {
    return this._mems;
  }

  addMember(user: User) {
    const mem = new Team(user);
    this._mems.push(mem);
    return mem;
  }

  addMembers(users: User[]) {
    let mems: Team[] = [];
    users.forEach(user => mems.push(this.addMember(user)))
    return users;
  }

  addSubteam(team: Team) {
    this._mems.push(team);
  }

  upLevel(newLeader: User) {
    const oldTeam = new Team(this._leader, this._mems);
    this._leader = newLeader;
    this._mems = [oldTeam];
  }

}
