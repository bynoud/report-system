import { NgModule } from "@angular/core";
import { UserComponent } from './user.component';
import { LoginUserComponent } from './login-user/login-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlashMessageModule } from '../core/flash-message/flash-message.module';
import { UserRoutingModule } from './user.route';
import { SharedModule } from '../core/shared.module';

@NgModule({
    declarations: [
        UserComponent,
        LoginUserComponent,
        EditUserComponent,
        CreateUserComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlashMessageModule,
        UserRoutingModule,
        SharedModule
    ]
})
export class UserModule {}
