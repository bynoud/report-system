import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { LoadingByDirective, LoadingByContentComponent } from './directives/loading-by.directive';
import { LoadingComponent } from './loading/loading.component';
import { FlashMessageComponent } from './flash-message/flash-message.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TeamViewComponent } from './sidebar/team-view.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';


@NgModule({
    declarations: [
        LoadingByDirective,
        LoadingComponent,
        LoadingByContentComponent,
        FlashMessageComponent,
        NavbarComponent,
        SidebarComponent,
        TeamViewComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
    ],
    exports: [
        LoadingByDirective,
        LoadingComponent,
        FlashMessageComponent,
        NavbarComponent,
        SidebarComponent,
    ],
    entryComponents: [
        LoadingByContentComponent,
    ]
})
export class SharedModule{}
