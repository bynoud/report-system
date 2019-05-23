import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlashMessageService } from './flash-message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flash-message',
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.css']
})
export class FlashMessageComponent implements OnInit, OnDestroy {

  messages: {[type: string]: {msg: string, class: string}} = {};
  flashMsg: {msg: string, class: string};
  msgTypes: string[] = []

  subs: Subscription[] = [];

  index = 0;

  constructor(
    private srv: FlashMessageService
  ) { 
  }

  ngOnInit() {
    this.subs.push(this.srv.onFlashChanged$().subscribe(msg => {
      this.flashMsg = msg.msg ? {msg: msg.msg, class: msg.class} : null;
    }))
    this.subs.push(this.srv.onMessageChanged$().subscribe(msg => {
      console.warn("msg comp receive", msg);
      
      if (this.msgTypes.indexOf(msg.type) < 0) {
        this.msgTypes.push(msg.type)
      }
      this.messages[msg.type] = {msg: msg.msg, class: msg.class};
    }))
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  clearMsg(type: string) {
    this.srv.clearMessage(type)
  }

  newFlash() {
    this.srv.flash(`FLASHH ${this.index++}`, "warn")    
  }

  newInfo() {
    this.srv.info(`INFOOO longgg  ggggggg ggggggggg gggggggggg gggggg ggg gggg gggggggg gg ggg ggggg gggg ggggg ggggg ggggggg ggg gggggg gggg ${this.index++}`)
  }

  newError() {
    this.srv.error(`ERRORRRR ${this.index++}`)
  }

}
