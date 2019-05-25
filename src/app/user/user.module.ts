import { NgModule } from "@angular/core";
import { UserComponent } from './user.component';
import { LoginUserComponent } from './login-user/login-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule } from './user.route';
import { SharedModule } from '../core/shared.module';
import { UserActivateComponent } from './user-activate/user-activate.component';

@NgModule({
    declarations: [
        UserComponent,
        LoginUserComponent,
        EditUserComponent,
        CreateUserComponent,
        UserActivateComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UserRoutingModule,
        SharedModule
    ]
})
export class UserModule {}
