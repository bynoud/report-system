import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { LoadingByDirective } from './directives/loading-by.directive';


@NgModule({
    declarations: [
        LoadingByDirective,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LoadingByDirective,
    ],
    entryComponents: [
        
    ]
})
export class SharedModule{}
