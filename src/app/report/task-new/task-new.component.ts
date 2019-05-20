import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ReportService } from '../report.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActivatedRoute } from '@angular/router';

const TARGETS_PH = [
  "Defeat Superman",
  "Capture Joker",
  "Keep Batman's identify secret",
  "Unite the Hustice League",
]


@Component({
  selector: 'app-task-new',
  templateUrl: './task-new.component.html',
  styleUrls: ['./task-new.component.css']
})
export class TaskNewComponent implements OnInit {
  userID: string;  

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private authService: AuthService
  ) { }
  
  taskForm: FormGroup;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['id'];
    })
    this.createForm();
  }

  // form control getter
  get project() { return this.taskForm.get('project') }
  get projectInvalid() {
    return this.project.invalid && (this.project.dirty || this.project.touched)
  }
  get title() { return this.taskForm.get('title') }
  get titleInvalid() {
    return this.title.invalid && (this.title.dirty || this.title.touched)
  }
  get desc() { return this.taskForm.get('desc') }
  get descInvalid() {
    return this.desc.invalid && (this.desc.dirty || this.desc.touched)
  }
  getTargetsDesc(i: number) {
    var tgts = this.taskForm.get('targets') as FormArray;
    return tgts.at(i).get('desc')
  }
  targetInvalid(i: number) {
    var d = this.getTargetsDesc(i);
    return d.invalid && (d.dirty || d.touched)
  }

  createForm() {
    this.taskForm = this.fb.group({
      project: ['', Validators.required],
      title: ['', Validators.required],
      desc: ['', Validators.required], 
      duedate: ['', Validators.required],
      targets: this.fb.array([ this.createTargetForm() ])
    });
    var due = new Date();
    due.setDate(due.getDate() + 7);
    this.taskForm.get('duedate').setValue(due.toISOString().split('T')[0]);
  }

  createTargetForm() {
    return this.fb.group({
      desc: ['', Validators.required],
      // status: ['', Validators.required],
    });
  }

  addTarget() {
    (this.taskForm.get('targets') as FormArray).push(this.createTargetForm())
  }
  
  getTargetPH(i: number) {
    return TARGETS_PH[i % TARGETS_PH.length];
  }

  removeTarget(i: number) {
    (this.taskForm.get('targets') as FormArray).removeAt(i)
  }

  newTask() {
    var value = this.taskForm.value;
    value.dueMs = Date.parse(value.duedate);  // YYYY-MM-DD
    value.targets.forEach(tgr => {
      tgr.status = "PENDING";
    });
    console.log("newtask", value);
    this.reportService.addTask(this.userID, value)
  }


}
