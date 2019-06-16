import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { environment } from 'src/environments/environment';
import { FlashMessageService } from '../flash-message/flash-message.service';

@Injectable({providedIn: 'root'})
export class FCFService {
    constructor(
        private fns: AngularFireFunctions,
        private msgService: FlashMessageService
    ) {
        if (!environment.production) {
            console.log("it's development");
            // fns.functions.useFunctionsEmulator('http://localhost:5000');
        }
    }

    createUser(data: any) {
        return this.fns.functions.httpsCallable('createUser')(data)
    }
    setRole(userID: string, role: string, level: number) {
        return this.fns.functions.httpsCallable('setRole')({userID, role, level})
    }
    setManager(managerID: string) {
        return this.fns.functions.httpsCallable('setManager')({managerID})
    }
    setCompanyEmail(companyEmail: string) {
        return this.fns.functions.httpsCallable('setCompanyEmail')({companyEmail})
    }

    remindLateMembers(uids: string[]) {
        return this.fns.functions.httpsCallable('remindLateMembers')({'uids': uids})
    }

    removeFcmToken(userID: string, token: string) {
        return this.fns.functions.httpsCallable('removeFcmToken')({userID, token})
    }


}