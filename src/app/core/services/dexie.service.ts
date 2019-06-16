import { Injectable } from "@angular/core";
import Dexie from 'dexie';
import { User } from 'src/app/models/user';

@Injectable({providedIn: 'root'})
export class DexieService extends Dexie {
    activeUser: Dexie.Table<User, number>;
}