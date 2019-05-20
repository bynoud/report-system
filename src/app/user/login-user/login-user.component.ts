import { Component, OnInit, OnDestroy, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
   }

  loginForm: FormGroup;
  errorMsg = "";
  subs: Subscription[] = [];

  ngOnInit() {
    this.subs.push(this.authService.activeUser$.subscribe(user => {
      console.log("user to redirect", user);
      if (user) this.router.navigate(['/'])
    }))
    this.createForm();

  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  createForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    })
  }

  onLogin(){
    var value = this.loginForm.value;
    this.errorMsg = "";
    this.authService.emailLogin(value.email, value.password)
      .then( uathUser => {
        console.log("logged in", uathUser);
      })
      .catch( err => {
        this.errorMsg = err;
        console.log("login error", err);
      })
  }

}
