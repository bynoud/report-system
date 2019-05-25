import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor() { }


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
