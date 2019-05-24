import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { LoadingByDirective, LoadingByContentComponent } from './directives/loading-by.directive';
import { LoadingComponent } from './loading/loading.component';


@NgModule({
    declarations: [
        LoadingByDirective,
        LoadingComponent,
        LoadingByContentComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LoadingByDirective,
        LoadingComponent
    ],
    entryComponents: [
        LoadingByContentComponent
    ]
})
export class SharedModule{}
