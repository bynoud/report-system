import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [],
})
export class AppComponent {

  constructor() { }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
