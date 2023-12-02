import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-job-species-field',
  templateUrl: './job-species-field.component.html',
  styleUrls: ['./job-species-field.component.css']
})
export class JobSpeciesFieldComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() sending: boolean = false;
  @Input() allowed_species: string[] = [];
}
