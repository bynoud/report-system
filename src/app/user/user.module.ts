import { NgModule } from "@angular/core";
import { UserComponent, UserLandingComponent } from './user.component';
import { LoginUserComponent } from './login-user/login-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserRoutingModule } from './user.route';
import { SharedModule } from '../core/shared.module';
import { UserActivateComponent } from './user-activate/user-activate.component';
import { SetupUserComponent } from './setup-user/setup-user.component';

@NgModule({
    declarations: [
        UserComponent,
        UserLandingComponent,
        LoginUserComponent,
        EditUserComponent,
        CreateUserComponent,
        UserActivateComponent,
        SetupUserComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UserRoutingModule,
        SharedModule
    ]
})
export class UserModule {}
