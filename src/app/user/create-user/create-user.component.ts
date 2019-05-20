import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { FlashMessageService } from 'src/app/core/flash-message/flash-message.service';

const LOREM_PIXEL = [
  "animals", "cats", "food",
  "city", "nature", "technics"
]

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  userForm: FormGroup;
  photoURL: string;

  emailDomain = "marvell.com";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private msgService: FlashMessageService
  ) { }

  ngOnInit() {
    var sub = Math.floor(Math.random() * LOREM_PIXEL.length);
    var sel = Math.floor(Math.random() * 11);
    this.photoURL = `http://lorempixel.com/400/400/${LOREM_PIXEL[sub]}/${sel}`;
    this.createForm();
  }

  createForm() {
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
    // this.fb.group({
    //   name: ['', Validators.required],
    //   email: ['', Validators.required],
    //   password: ['', Validators.required],
    //   // age: ['', Validators.required ]
    // });
  }

  onSignup(){
    var value = this.userForm.value;
    this.authService.emailSignUp(value.name, value.email, this.photoURL, "", value.password)
    .then(
      _ => {
        // this.resetFields();
        this.router.navigate(['./']);
      }
    )
    .catch( err => {
      this.msgService.error(err)
    })
  }
  
  // resetFields(){
  //   this.photoURL = "https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg";
  //   this.userForm = this.fb.group({
  //     name: new FormControl('', Validators.required),
  //     email: new FormControl('', Validators.required),
  //     // age: new FormControl('', Validators.required),
  //   });
  // }


}
