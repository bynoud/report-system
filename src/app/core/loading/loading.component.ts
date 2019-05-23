import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  @Input() size: string;
  
  constructor(
  ) { }

  ngOnInit() {
    if (!this.size) this.size = "150px";
  }


}
