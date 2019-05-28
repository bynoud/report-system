import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({providedIn: 'root'})
export class FCFService {
    constructor(
        private fns: AngularFireFunctions
    ) {
        fns.functions.useFunctionsEmulator('http://localhost:5000');
    }

    createUser(data: any) {
        return this.fns.functions.httpsCallable('createUser')(data)
    }

    remindLateMembers(uids: string[]) {
        return this.fns.functions.httpsCallable('remindLateMembers')({'uids': uids})
    }


}