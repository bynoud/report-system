import { Component, OnInit } from '@angular/core';
import { FlashMessageService } from './flash-message.service';

@Component({
  selector: 'app-flash-message',
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.css']
})
export class FlashMessageComponent implements OnInit {

  messages: {[type: string]: {msg: string, class: string}} = {};
  flashMsg: {msg: string, class: string};
  msgTypes: string[] = []

  index = 0;

  constructor(
    private srv: FlashMessageService
  ) { 
  }

  ngOnInit() {
    this.srv.onFlashChanged(msg => {
      this.flashMsg = msg.msg ? {msg: msg.msg, class: msg.class} : null;
    })
    this.srv.onMessageChanged(msg => {
      if (this.msgTypes.indexOf(msg.type) < 0) {
        this.msgTypes.push(msg.type)
      }
      this.messages[msg.type] = {msg: msg.msg, class: msg.class};
    })
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
