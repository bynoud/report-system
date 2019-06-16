import { Injectable } from "@angular/core";
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, debounceTime, filter } from 'rxjs/operators';

type FlashMessage = {msg: string, class: string, duration: number}
export type Message = {msg: string, type: string, class: string}

@Injectable({providedIn: "root"})
export class FlashMessageService {
    
    // private msgs = {info: "", warn: "", error: ""}
    // private flashMsg: FlashMessage
    private flashStart$ = new Subject<FlashMessage>();
    private messages$ = new Subject<Message>();
    private msgFlash$ = new Subject<FlashMessage>();

    private bsAlertClass = {
        info: "info",
        warn: "warning",
        error: "danger",
    }
    // private msgTypes = ["info", "warn", "error"]

    private savedMsg = {};

    constructor(
        private router: Router
    ) {
        this.subNavigationStart();
        this.subFlashMessage();
    }

    // get messages() { return this.msgs }
    // get flashMessage() { return this.flashMsg }
    // get messageTypes() { return this.msgTypes }
    // getClass(type: string) { return this.bsAlertClass[type] }

    private subNavigationStart() {
        this.router.events.pipe(
            filter(ev => ev instanceof NavigationStart),
            debounceTime(200)   // if navigation is too fast, probaly this is program de-tour
        ).subscribe(ev => {
            // the message is cleared at navigation start
            // this.msgs = {info:"", warn:"", error:""}
            for (var k in this.bsAlertClass) {
                this.clearMessage(k)
            }
        })
    }

    private getClass(type: string) {
        if (type in this.bsAlertClass) {
            return "alert alert-" + this.bsAlertClass[type]
        } else {
            console.error(`Flash message type '${type}' is not found`);
            return "alert alert-danger"
        }
    }

    private subFlashMessage() {
        this.flashStart$.pipe(
            // cancel previous sub, if new flash message is emitted
            switchMap(flash => {
                console.warn("flash active", flash);
                
                this.msgFlash$.next(flash);
                return new Promise( resolve => {
                    setTimeout(resolve, flash.duration) 
                });
            })
        ).subscribe(() => {
            console.warn("flash clear");
            
            this.msgFlash$.next({msg: "", class: "", duration: 0})
         } )
    }

    // if 'persist' is set, this message survise 1 navigation event
    info(msg: string, persist: boolean = false) { this.sendMessage(msg, 'info', persist) }
    warn(msg: string, persist: boolean = false) { this.sendMessage(msg, 'warn', persist) }
    error(msg: string, persist: boolean = false) { this.sendMessage(msg, 'error', persist) }

    flash(msg: string, type: string, durationMs: number = 4000) {
        console.warn("flash", msg, type, durationMs);
        
        this.flashStart$.next({msg, class: this.getClass(type), duration: durationMs})
    }

    addMessageType(type: string, bsAlertClass: string) {
        this.bsAlertClass[type] = bsAlertClass;
    }

    sendMessage(msg: string, type: string, persist: boolean = false) {
        if (persist) this.savedMsg[type] = msg;
        this.messages$.next({msg, type, class: this.getClass(type)})
        console.warn("message sent", msg, type, persist);
    }

    clearMessage(type: string) {
        if (this.savedMsg[type]) {
            // if it persist, re-emit that message
            this.sendMessage(this.savedMsg[type], type);
            delete this.savedMsg[type];
        } else {
            this.messages$.next({msg: "", type: type, class: ""})
            console.warn("message cleared", type)
        }
    }

    onMessageChanged$() {
        return this.messages$
    }

    onFlashChanged$() {
        return this.msgFlash$
    }


}