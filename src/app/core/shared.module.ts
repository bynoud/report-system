import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { LoadingByDirective, LoadingByContentComponent } from './directives/loading-by.directive';
import { LoadingComponent } from './loading/loading.component';
import { FlashMessageComponent } from './flash-message/flash-message.component';


@NgModule({
    declarations: [
        LoadingByDirective,
        LoadingComponent,
        LoadingByContentComponent,
        FlashMessageComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LoadingByDirective,
        LoadingComponent,
        FlashMessageComponent
    ],
    entryComponents: [
        LoadingByContentComponent
    ]
})
export class SharedModule{}
