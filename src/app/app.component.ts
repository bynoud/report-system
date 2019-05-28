import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';
import { FCMService } from './core/services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(
    private fcmService: FCMService
  ) {
    this.fcmService.onMessageRecieved().subscribe(msg => {
      console.log("FCM", msg);
      
    })

   }

  ngOnInit() {
    // const userId = 'user001';
    // this.fcmService.requestPermission(userId)
    // this.fcmService.onMessageRecieved().subscribe(msg => {
    //   console.log("FCM", msg);
      
    // })

  }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  sidebarShow = false;
  toggleSidebar() {
    this.sidebarShow = !this.sidebarShow;
  }
  
}
