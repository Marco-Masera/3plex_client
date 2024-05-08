import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorPopupComponent } from './error-popup/error-popup.component';


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
      allGenes: new FormControl(""),
      interestGenes: new FormControl(""),
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

  parseAndValidateGenesList(){
    function parseSingleList(list: string){
      //Input: string containing genes
      //Output: array of genes - separation can be \n whitespace \t and ,
      return list.replaceAll(" ", "\n").replaceAll("\t", "\n").replaceAll(",", "\n")
        .split("\n").filter(elem => elem.length > 0)
    }
    const allGenesFormatted = parseSingleList(this.formGroup.value.allGenes);
    const interestGenesFormatted = parseSingleList(this.formGroup.value.interestGenes);
    allGenesFormatted.sort(); interestGenesFormatted.sort();
    //Error if one list is empty
    if (allGenesFormatted.length == 0){
      return {error: true, type:0, allGenesFormatted: allGenesFormatted, interestGenesFormatted:interestGenesFormatted}
    } else if (interestGenesFormatted.length == 0){
      return {error: true, type:1, allGenesFormatted: allGenesFormatted, interestGenesFormatted:interestGenesFormatted}
    } 
    //Error if background genes is not subset of putative
    //!! This function works only if the 2 arrays are sorted
    let i = 0; let j = 0;
    const notIncluded = [];
    while(j < interestGenesFormatted.length){
      if (allGenesFormatted[i] == interestGenesFormatted[j]){
        j++;
      } else if (i < (allGenesFormatted.length-1) && allGenesFormatted[i] < interestGenesFormatted[j]){
        i++;
      } else {
        notIncluded.push(interestGenesFormatted[j]);
        j++;
      }
    }
    if (notIncluded.length > 0){
      return {error: true, type:2, notIncluded: notIncluded, allGenesFormatted: allGenesFormatted, interestGenesFormatted:interestGenesFormatted}
    } else {
      return {error: false, allGenesFormatted: allGenesFormatted, interestGenesFormatted:interestGenesFormatted}
    }
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
      }
    })
    this.triplexService.get_allowed_species_and_iterations().then ((response: any) => {
      if (response.success){ 
        this.allowed_species = response.payload.species;
      }
    })
  }

  openPopupForError(error: any){
    var data = {}
    switch(error.type){
      case 0:
        //One list is empty
        data = {type:0, message: "Putative genes list is empty"};
        this.formGroup.patchValue({"allGenes": ""}); break;
      case 1:
        //One list is empty
        data = {type:0, message: "Background genes list is empty"};
        this.formGroup.patchValue({"interestGenes": ""}); break;
      case 2:
        //Background genes not included
        data = {type:1, message: "Some background genes are not included in putative genes",
          list: error.notIncluded}; break;
    }
    const dialogRef = this.dialog.open(ErrorPopupComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state) {
        switch (result.state){
          case 1: //Add genes to putative
            const newAllGenes = error.allGenesFormatted.concat(error.notIncluded);
            this.formGroup.patchValue({"allGenes": newAllGenes.join("\n")});
          break;
          case 2: //Remove genes from background
          const newInterestGenes = error.interestGenesFormatted.filter((elem:string) => !error.notIncluded.includes(elem));
          this.formGroup.patchValue({"interestGenes": newInterestGenes.join("\n")});
          break;
        }
      }
    });
  }

  onFailure(response: any, parsedAndValidatedGenes: any){
    if (response.notIncludedInMANE){
      var data = {type: 2, message: "Some genes specified are not included in MANE", list: response.notIncludedInMANE}
      const dialogRef = this.dialog.open(ErrorPopupComponent, {
        data: data,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.state && result.state == 1) {
          const newAllGenes = parsedAndValidatedGenes.allGenesFormatted.filter(
            (elem:string) => !response.notIncludedInMANE.includes(elem)
          );
          const newInterestGenes = parsedAndValidatedGenes.interestGenesFormatted.filter(
            (elem:string) => !response.notIncludedInMANE.includes(elem)
          )
          this.formGroup.patchValue({"allGenes": newAllGenes.join("\n")});
          this.formGroup.patchValue({"interestGenes": newInterestGenes.join("\n")});
        }
      });
    } else {
      window.alert("Cannot submit job: " + response.error);
    }
  }
  onSuccess(response: any){
    this._router.navigate(['checkjob/token/', response.payload.token.token]);
  }

  submitForm(){
    if (this.sending){return;}
    const error = this.parseAndValidateGenesList();
    if (error.error){
      this.openPopupForError(error);
      return;
    }

    const isUsingSequence = this.formGroup.value.ssRNA_chosen_type==ssRNA_input_type.sequence;
    const toSubmit = {
      INTEREST_GENES: error.interestGenesFormatted,
      ALL_GENES: error.allGenesFormatted,

      SSRNA_FASTA: isUsingSequence ? this.ssRNAFile : undefined,
      SSRNA_STRING: isUsingSequence ? this.formGroup.value.ssRNATextual : undefined,
      SSRNA_TRANSCRIPT_ID: !isUsingSequence ? this.formGroup.value.ssRNA_transcript_id : undefined,
      JOBNAME: this.formGroup.value.jobName || undefined,
      EMAIL: this.formGroup.value.email || undefined,
      min_len: this.formGroup.value.min_len || undefined,
      max_len: this.formGroup.value.max_len || undefined,
      error_rate: this.formGroup.value.error_rate || undefined,
      guanine_rate: this.formGroup.value.guanine_rate || undefined,
      filter_repeat: this.formGroup.value.filter_repeat || undefined,
      consecutive_errors: this.formGroup.value.consecutive_errors || undefined,
      SSTRAND: this.formGroup.value.SSTRAND || undefined,
      SPECIES: this.formGroup.value.selected_species || undefined
    }

    this.triplexService.submitJobPromoterTest(toSubmit).then(response => {
      this.sending = false;
      if (response["success"]){
        this.onSuccess(response);
      } else {
        this.onFailure(response, error);
      }
    }).catch(exception => {
      this.sending = false; 
      this.onFailure(exception, error);
    });
  }
}
