import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashMessageComponent } from './flash-message.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    FlashMessageComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    FlashMessageComponent
  ]
})
export class FlashMessageModule { }
