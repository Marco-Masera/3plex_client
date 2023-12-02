import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';


//Checks for the Send button
function formValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return null;
}

@Component({
  selector: 'app-sendjob-promoter-test',
  templateUrl: './sendjob-promoter-test.component.html',
  styleUrls: ['./sendjob-promoter-test.component.css']
})
export class SendjobPromoterTestComponent {
  formGroup: FormGroup;
  default_triplex_params: any;
  allowed_species: string[] = [];
  sending: boolean = false;

  constructor(private triplexService: TriplexServiceService, private _router: Router, public dialog: MatDialog) {
    this.formGroup = new FormGroup({
      selected_species: new FormControl('hsapiens'),
      jobName: new FormControl(null),
      email: new FormControl(null),
      min_len: new FormControl(null),
      max_len: new FormControl(null),
      error_rate: new FormControl(null),
      guanine_rate: new FormControl(null),
      filter_repeat : new FormControl(null),
      consecutive_errors: new FormControl(null),
      SSTRAND: new FormControl(null),
      use_random: new FormControl(true),
      random_iterations: new FormControl(0)
    }, { validators: formValidator });
  }

  ngOnInit(){
    this.formGroup
    .controls["selected_species"]
    .valueChanges
    .subscribe(selectedValue => {
          //Do something when selected species changes
    });

    this.triplexService.get_triplex_default_params().then( response => {
      if (response.success){
        this.default_triplex_params = response.payload
        this.formGroup.patchValue({filter_repeat: this.default_triplex_params?.filter_repeat.default});
        console.log(this.default_triplex_params)
      }
    })
    this.triplexService.get_allowed_species_and_iterations().then ((response: any) => {
      if (response.success){ 
        this.allowed_species = response.payload.species;
      }
    })
  }

  submitForm(){
    if (this.sending){return;}
    window.alert("Ehhh ti piacerebbe!")
  }
}
