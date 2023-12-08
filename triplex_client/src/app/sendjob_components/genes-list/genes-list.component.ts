import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

const examples: any = {
  "putativeGenes": `TSPAN6
CFH
FUCA2
ENPP4
SEMA3F
CYP51A1
MYH15`,
  "backgroundGenes": `CFH
FUCA2
ENPP4`
}

@Component({
  selector: 'app-genes-list',
  templateUrl: './genes-list.component.html',
  styleUrls: ['./genes-list.component.css']
})
export class GenesListComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() sending: boolean = false;
  @Input() title: string = "";
  @Input() toolTip: string = "";
  @Input() formControlName: string = "";

  getExample(){
    const v:any = {}
    v[this.formControlName] = examples?.[this.formControlName] || ""
    this.formGroup.patchValue(v);
  }
}
