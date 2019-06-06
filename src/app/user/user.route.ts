import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { UserComponent, UserLandingComponent } from './user.component';
import { LoginUserComponent } from './login-user/login-user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthService as AuthGaurd } from 'src/app/core/services/auth.service';
import { SetupUserComponent } from './setup-user/setup-user.component';

const routes: Routes = [{
    path: 'user', component: UserComponent,
    children: [
        {path: '', component: UserLandingComponent},
        {path: 'login', component: LoginUserComponent},
        {path: 'new', component: CreateUserComponent},
        {path: 'edit', component: SetupUserComponent},
        {path: ':id', component: EditUserComponent, canActivate: [AuthGaurd]},
    ]
}]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}