import { Component, OnInit, OnDestroy, ViewContainerRef, ComponentFactoryResolver, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';

@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private msgService: FlashMessageService
  ) {
   }

  loginBy = {google: true, facebook: false, email: false}

  loginForm: FormGroup;
  subs: Subscription[] = [];

  loading$ = new BehaviorSubject<boolean>(false);

  // loading = false;
  // toggleLoading() {
  //   this.loading = !this.loading;
  //   this.loading$.next(this.loading);
  // }

  ngOnInit() {

    this.subs.push(this.route.paramMap.subscribe( params => {
      this.loginBy.facebook = params.get('facebook') ? true : false;
      this.loginBy.email = params.get('email') ? true : false;
    }));

    // this.subs.push(this.authService.$().subscribe(user => {
    //   console.log("user to redirect", user);
    //   if (user) {
    //     if (user.)
    //     this.router.navigate(['/']);
    //   }
    //   else {
    //     this.loading$.next(false)
    //   }
    // }))
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
      .then(() => {
        // wait for auth state to change, otherwise 'report' page will reject it again
        // this.router.navigate(['/report'])
      })
      .catch(() => {
        console.log("EE");
        
        this.loading$.next(false)})
  }


  async oathLogin(provider: string) {
    this.loading$.next(true);
    const cred = await ((provider == 'google') ? this.authService.googleLogin()
                                        : this.authService.facebookLogin())
      .catch(err => {
        this.msgService.error(err.message);
        return null;
      })

    if (cred!=null) {
      if (cred.additionalUserInfo.isNewUser) {
        this.msgService.warn("This is the first time I see you. Take some time to introduce yourself", true);
        this.router.navigate(['../edit'], {relativeTo: this.route})
      } else {
        this.msgService.info("Successfully logged in", true);
        this.router.navigate(['/report'])
      }
    } else {
      this.loading$.next(false)
    }

  }

  // async googleLogin() {
  //   this.loading$.next(true);
  //   this.authService.googleLogin()
  //     .then(cred => {
  //       if (cred.additionalUserInfo.isNewUser) this.router.navigate(['./edit'])
  //       else this.router.navigate(['/report'])
  //     })
  //     .catch(err => {
  //       this.msgService.error(err.message);
  //       this.loading$.next(false)
  //     })
  // }

  // facebookLogin() {
  //   this.loading$.next(true);
  //   this.authService.facebookLogin()
  //     .then(cred => {
  //       if (cred.additionalUserInfo.isNewUser) this.router.navigate(['./edit'])
  //       else this.router.navigate(['/report'])
  //     })
  //     .catch(err => {
  //       this.msgService.error(err.message);
  //       this.loading$.next(false)
  //     })
  // }

}
