import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {

  userForm: FormGroup;
  user: User;
  subs: Subscription[] = [];

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'email': [
      { type: 'required', message: 'email is required.' }
    ],
    'age': [
      { type: 'required', message: 'Age is required.' },
    ]
  };

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }


  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private authService: AuthService) { }

  ngOnInit() {
    this.subs.push(this.route.params.subscribe( params => {
      var userID = params['id']; //['userID'];
      this.subs.push(this.authService.getUser$(userID, "from edit user")
      .subscribe(
        user => {
          this.user = user;
          this.createForm();
        }
      ))
    }))
    // this.route.data.subscribe(routeData => {
    //   let data = routeData['userID'];
    //   if (data) {
    //     this.user = data.payload.data();
    //     this.user.id = data.payload.id;
    //     this.createForm();
    //   }
    // })
  }

  createForm() {
    this.userForm = this.fb.group({
      name: [this.user.displayName, Validators.required],
      email: [this.user.email, Validators.required],
      // age: [this.user.age, Validators.required]
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
