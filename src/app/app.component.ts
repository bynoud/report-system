import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  // templateUrl: './app.component.html',
  template: `
    <app-navbar></app-navbar>
    <app-flash-message></app-flash-message>
    <router-outlet></router-outlet>
  `,
  styleUrls: []
})
export class AppComponent {}
