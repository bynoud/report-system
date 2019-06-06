import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { slideInAnimation } from './animations';
import { FCMService } from './core/services/fcm.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(
    private router: Router,
    private authService: AuthService,
    private fcmService: FCMService
  ) {}

  ngOnInit() {
    // this.authService.getActiveUser$().then(user => {
    //   console.log("app to redirect", user);
    //   if (user) this.router.navigate(['/report'])
    //   else this.router.navigate(['/user/login'])
    // })
    this.fcmService.onMessageRecieved().subscribe(msg => {
      console.log("FCM", msg);
    })
  }



  // constructor(
  //   private fcmService: FCMService
  // ) {
  //   this.fcmService.onMessageRecieved().subscribe(msg => {
  //     console.log("FCM", msg);
      
  //   })

  //  }

  // ngOnInit() {
  //   // const userId = 'user001';
  //   // this.fcmService.requestPermission(userId)
  //   // this.fcmService.onMessageRecieved().subscribe(msg => {
  //   //   console.log("FCM", msg);
      
  //   // })

  // }


  // delay(ms: number) {
  //   return new Promise( resolve => setTimeout(resolve, ms) );
  // }

  // prepareRoute(outlet: RouterOutlet) {
  //   return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  // }

  // sidebarShow = false;
  // toggleSidebar() {
  //   this.sidebarShow = !this.sidebarShow;
  // }
  
}
