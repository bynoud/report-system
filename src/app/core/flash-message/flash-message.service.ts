import { Injectable } from "@angular/core";
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type FlashMessage = {msg: string, type: string, duration: number}
export type Message = {msg: string, type: string, class: string}

@Injectable({providedIn: "root"})
export class FlashMessageService {
    
    // private msgs = {info: "", warn: "", error: ""}
    // private flashMsg: FlashMessage
    private flashStart$ = new Subject<FlashMessage>();
    private messages$ = new Subject<Message>();
    private msgFlash$ = new Subject<Message>();

    private bsAlertClass = {
        info: "info",
        warn: "warning",
        error: "danger",
    }
    // private msgTypes = ["info", "warn", "error"]

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
        this.router.events.subscribe(ev => {
            // the message is cleared at navigation start
            if (ev instanceof NavigationStart) {
                console.log("srv nav", ev);
                // this.msgs = {info:"", warn:"", error:""}
                for (var k in this.bsAlertClass) {
                    this.messages$.next({msg: "", type: k, class: ""})
                }
            }
        })
    }

    private getClass(type: string) {
        return "alert alert-" + this.bsAlertClass[type]
    }

    private subFlashMessage() {
        this.flashStart$.pipe(
            // cancel previous sub, if new flash message is emitted
            switchMap(flash => {
                this.msgFlash$.next({
                    msg: flash.msg, 
                    type: flash.type,
                    class: this.getClass(flash.type)
                });
                console.log("flash set", flash);
                return new Promise( resolve => setTimeout(resolve, flash.duration) );
            })
        ).subscribe(() => {
            this.msgFlash$.next({msg: "", type: "", class: ""})
            console.log("flash clear");
         } )
    }

    info(msg: string) { this.sendMessage(msg, 'info') }
    warn(msg: string) { this.sendMessage(msg, 'warn') }
    error(msg: string) { this.sendMessage(msg, 'error') }

    flash(msg: string, type: string, durationMs: number = 2000) {
        this.flashStart$.next({msg, type, duration: durationMs})
    }

    addMessageType(type: string, bsAlertClass: string) {
        this.bsAlertClass[type] = bsAlertClass;
    }

    sendMessage(msg: string, type: string) {
        if (!(type in this.bsAlertClass)) {
            console.error(`Flash message type '${type}' is nout found`);
        } else {
            console.log("srv send", msg, type);
            
            this.messages$.next({msg, type, class: this.getClass(type)})
        }
    }

    clearMessage(type: string) {
        if (type in this.bsAlertClass) {
            this.messages$.next({msg: "", type: type, class: ""})
        }
    }

    onMessageChanged(cb: (msg: Message) => void) {
        this.messages$.subscribe(cb)
    }

    onFlashChanged(cb: (msg: Message) => void) {
        this.msgFlash$.subscribe(cb)
    }


}