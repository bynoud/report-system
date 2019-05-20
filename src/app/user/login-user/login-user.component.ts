import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  loginForm: FormGroup;
  errorMsg = "";

  ngOnInit() {
    this.createForm();
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
