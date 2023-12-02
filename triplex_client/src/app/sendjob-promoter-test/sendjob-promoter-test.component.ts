import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';


//Checks for the Send button
function formValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return null;
}
class ssRNA_input_type{
  static sequence = "s"; static transcript_id = "t"
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

  //ssRNA: like in the triplex prediction case
  ssRNAFile: File | undefined = undefined;
  ssRNAMaxSize = 1;

  constructor(private triplexService: TriplexServiceService, private _router: Router, public dialog: MatDialog) {

    this.formGroup = new FormGroup({
      selected_species: new FormControl('hsapiens'),
      ssRNA_chosen_type: new FormControl(ssRNA_input_type.transcript_id),
      ssRNA_transcript_id: new FormControl(null),
      ssRNA: new FormControl(null),
      ssRNATextual: new FormControl(null),
      putativeGenes: new FormControl(null),
      backgroundGenes: new FormControl(null),
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
  setssRNA_file(file: File){
    this.ssRNAFile = file;
  }


  ngOnInit(){
    this.formGroup
    .controls["selected_species"]
    .valueChanges
    .subscribe(selectedValue => {
      if (!selectedValue){
        this.formGroup.patchValue({
          ssRNA_chosen_type: ssRNA_input_type.sequence
        });
      }
      this.formGroup.patchValue({
        ssRNA_transcript_id: null
      })
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
    console.log(this.formGroup)
    window.alert("Ehhh ti piacerebbe!!")
  }
}
