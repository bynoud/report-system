import { Component, OnInit, OnDestroy, ViewContainerRef, ComponentFactoryResolver, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';

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
  subs: Subscription[] = [];

  loading$ = new BehaviorSubject<boolean>(true);

  ngOnInit() {
    this.subs.push(this.authService.activeUser$.subscribe(user => {
      console.log("user to redirect", user);
      if (user) this.router.navigate(['/'])
      else {
        this.loading$.next(false)
      }
    }))
    this.createForm();

  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
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
    this.loading$.next(true);
    this.authService.emailLogin(value.email, value.password)
  }

}
