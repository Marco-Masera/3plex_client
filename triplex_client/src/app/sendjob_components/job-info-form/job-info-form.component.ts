import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-job-info-form',
  templateUrl: './job-info-form.component.html',
  styleUrls: ['./job-info-form.component.css']
})
export class JobInfoFormComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() sending: boolean = false;
}
