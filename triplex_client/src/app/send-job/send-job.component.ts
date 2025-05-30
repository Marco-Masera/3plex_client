import { Component } from '@angular/core';
import { Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { JobToSubmit } from '../model/jobToSubmit';
import { Router } from '@angular/router';
import { LncRnaTranscript } from '../model/lnc_rna_transcript';
import { DnaTargetSites } from '../model/dna_target_sites';
import { InfoPopupComponent } from '../generic-searchable-dropdown/info-popup/info-popup.component';
import { MatDialog } from '@angular/material/dialog';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


//Checks for the Send button
function sendButtonChecks(control: AbstractControl): { [key: string]: boolean } | null {
  const ssRNAValue: String | null = control.get('ssRNA')?.value;
  const ssRNATextual = control.get('ssRNATextual')?.value;
  const dsDNA_chosen_type = control.get("dsDNA_chosen_type")?.value
  const dsDNATargetSite = control.get("dsDNATargetSite")?.value
  const dsDNA = control.get("dsDNA")?.value
  const ssRNA_Id = control.get("ssRNA_transcript_id")?.value
  const ssRNA_chosen_type = control.get("ssRNA_chosen_type")?.value
  const species = control.get("selected_species")?.value
  //For dna either you provide type=sequence and a file, or you provide a chosen target site
  if (dsDNA_chosen_type == ssRNA_input_type.sequence){
    //If file is .bed, a species must be provided
    if (!dsDNA || (dsDNA.split(".").pop()=="bed" && !species)){
      return { sendButtonChecks: true };
    } else {
      console.log(dsDNA.toString().split(".").pop())
    }
  }
  if (dsDNA_chosen_type != ssRNA_input_type.sequence){
    //dsDNATargetSite must be specified and the species field must be equal to the chosen specie
    if (!dsDNATargetSite || dsDNATargetSite.species != species){
      return { sendButtonChecks: true };
    }
  }

  if (ssRNA_chosen_type == ssRNA_input_type.sequence && !ssRNAValue && !ssRNATextual) {
    return { sendButtonChecks: true };
  } else if (ssRNA_chosen_type == ssRNA_input_type.transcript_id && (!ssRNA_Id || !species)){
    return { sendButtonChecks: true };
  }
  return null;
}

interface triplex_param_descr{
  default: string; description: string
}

class ssRNA_input_type{
  static sequence = "s"; static transcript_id = "t"
}

@Component({
  selector: 'app-send-job',
  templateUrl: './send-job.component.html',
  styleUrls: ['./send-job.component.css']
})
export class SendJobComponent {
  ssRNAMaxSize = 1;
  dsDNAMaxSize = 300;

  formGroup: FormGroup;
  dsDNAFile: File | undefined;
  ssRNAFile: File | undefined;
  sending: boolean = false;
  allowed_species: string[] = [];
  dsDnaTargetSites: { [species: string]: DnaTargetSites[] } = {}
  n_iterations_possible = []
  default_triplex_params: any 
  dsDNAToolTip = "Target DNA sequences, either chosen from our database of target sites or provided as a multi-FASTA file containing dsDNA sequences or a bed file containing the target coordinates (max size: " + this.dsDNAMaxSize + " MB)."
  randomizationToolTip = "Run 3plex on randomized versions of the target dsDNA to produce a control track."

  ssRNAError: string | null = null;
  dsDNAError: string | null = null;
  
  constructor(private triplexService: TriplexServiceService, private _router: Router, public dialog: MatDialog) {
    this.formGroup = new FormGroup({
      selected_species: new FormControl('hsapiens'),
      ssRNA_chosen_type: new FormControl(ssRNA_input_type.transcript_id),
      ssRNA_transcript_id: new FormControl(null),
      ssRNA: new FormControl(null),
      ssRNATextual: new FormControl(null),
      dsDNA_chosen_type: new FormControl(ssRNA_input_type.transcript_id),
      dsDNA: new FormControl(null),
      dsDNATargetSite: new FormControl(null),
      jobName: new FormControl(null),
      email: new FormControl(null),
      min_len: new FormControl(null),
      max_len: new FormControl(null),
      error_rate: new FormControl(null),
      guanine_rate: new FormControl(null),
      filter_repeat : new FormControl(null),//on off
      consecutive_errors: new FormControl(null),
      SSTRAND: new FormControl(null),
      use_random: new FormControl(true),
      random_iterations: new FormControl(0)
    }, { validators: sendButtonChecks });
  }

  setssRNA_file(file: File){
    this.ssRNAFile = file;
    this.ssRNAError = null;
  }

  ngOnInit(){
    this.formGroup
    .controls["selected_species"]
    .valueChanges
    .subscribe(selectedValue => {
          if (!selectedValue){
            this.formGroup.patchValue({
              ssRNA_chosen_type: ssRNA_input_type.sequence,
              dsDNA_chosen_type: ssRNA_input_type.sequence
            });
          } else if (selectedValue != "hsapiens"){
            this.formGroup.patchValue({
              dsDNA_chosen_type: ssRNA_input_type.sequence
            });
          }
          this.formGroup.patchValue({
            ssRNA_transcript_id: null,
            dsDNATargetSite: null
          })
    });

    this.triplexService.get_dna_targets().then(response => this.dsDnaTargetSites = response);

    this.triplexService.get_triplex_default_params().then( response => {
      if (response.success){
        this.default_triplex_params = response.payload
        this.formGroup.patchValue({filter_repeat: this.default_triplex_params?.filter_repeat.default});
      }
    })
    this.triplexService.get_allowed_species_and_iterations().then ((response: any) => {
      if (response.success){ 
        this.allowed_species = response.payload.species;
        this.n_iterations_possible = response.payload.iterations;
        this.formGroup.patchValue({random_iterations: this.n_iterations_possible[0]});
      }
    })
  }

  reset_selected_dsDNA(){
    this.formGroup.patchValue({dsDNA: null});
    this.dsDNAFile = undefined;
    this.dsDNAError = null;
  }

  checkFileFastaFormat(file: File | undefined): boolean{
    return file?.name.split(".").pop()=="fa" 
  }

  checkFileBedFormat(file: File | undefined): boolean{
    return file?.name.split(".").pop()=="bed" 
  }

  validateFileName(fileName: string): boolean{
    const regex = /^[a-zA-Z0-9_.-]+$/;
    return regex.test(fileName);
  }

  onDnaChange(event: Event){
    this.dsDNAError = null;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (input.files[0].size > this.dsDNAMaxSize*1000000){
        window.alert("Your input file exceed maximum file size of " + this.dsDNAMaxSize + " MB")
        this.formGroup.patchValue({dsDNA: null});
      } else {
        if (!this.checkFileFastaFormat(input.files[0]) && !this.checkFileBedFormat(input.files[0])){
          window.alert("Please provide a file in FASTA or BED format (.fa, .bed)")
          this.formGroup.patchValue({dsDNA: null});
        } else if (!this.validateFileName(input.files[0].name)){
          window.alert("Invalid file name: allowed characters are a-z, A-Z, 0-9, and - _ . symbols")
          this.formGroup.patchValue({dsDNA: null});
        } else {
          this.formGroup.patchValue({dsDNA: input.files[0].name})
          this.dsDNAFile = input.files[0];
        }
      }
    }
  }

  onSuccess(response: any){
    this._router.navigate(['checkjob/token/', response.payload.token.token]);
  }

  onFailure(response: any){
    if (response.errorType && response.errorType == "ssRNA_error"){
      const error = response.whatsWrong;
      this.ssRNAError = error || "Unknown error";
    } else if (response.errorType && response.errorType == "dsDNA_error"){
      const error = response.whatsWrong;
      this.dsDNAError = error || "Unknown error";
    } else {
      window.alert("Cannot submit job: " + response.error);
    }
  }

  submitForm() {if (this.sending){return;}
    if (this.formGroup.valid) {
      this.ssRNAError = null;
      this.dsDNAError = null;
      this.sending = true;
      const isUsingSequence = this.formGroup.value.ssRNA_chosen_type==ssRNA_input_type.sequence;
      const isUsingdsDNATarget = this.formGroup.value.dsDNA_chosen_type!=ssRNA_input_type.sequence
      let job: JobToSubmit = {
        SSRNA_FASTA: isUsingSequence ? this.ssRNAFile : undefined,
        SSRNA_STRING: isUsingSequence ? this.formGroup.value.ssRNATextual : undefined,
        SSRNA_TRANSCRIPT_ID: !isUsingSequence ? this.formGroup.value.ssRNA_transcript_id : undefined,
        DSDNA_FASTA: !isUsingdsDNATarget ? (this.checkFileFastaFormat(this.dsDNAFile) ? this.dsDNAFile : undefined) : undefined,
        DSDNA_BED: !isUsingdsDNATarget ? (this.checkFileBedFormat(this.dsDNAFile) ? this.dsDNAFile : undefined) : undefined,
        DSDNA_TARGET_NAME: isUsingdsDNATarget ? this.formGroup.value.dsDNATargetSite.name : undefined,
        JOBNAME: this.formGroup.value.jobName || undefined,
        EMAIL: this.formGroup.value.email || undefined,
        min_len: this.formGroup.value.min_len || undefined,
        max_len: this.formGroup.value.max_len || undefined,
        error_rate: this.formGroup.value.error_rate || undefined,
        guanine_rate: this.formGroup.value.guanine_rate || undefined,
        filter_repeat: this.formGroup.value.filter_repeat || undefined,
        consecutive_errors: this.formGroup.value.consecutive_errors || undefined,
        SSTRAND: this.formGroup.value.SSTRAND || undefined,
        SPECIES: this.formGroup.value.selected_species || undefined,
        USE_RANDOM: (this.formGroup.value.use_random ? this.formGroup.value.random_iterations : 0)
      }
      this.triplexService.submitJob(job).then(response => {
        this.sending = false;
        if (response["success"]){
          this.onSuccess(response);
        } else {
          this.onFailure(response);
        }
      }).catch(error => {this.sending = false; this.onFailure(error); });
    }
  }

  pathToName(path: string|null|undefined): string|undefined{
    if (!path) return "";
    var filename = path.replace(/^.*[\\\/]/, '')
    return filename.split("\\").pop();
  }

  dnaTargetSearchSelectOption(selected: DnaTargetSites){
    this.formGroup.patchValue({dsDNATargetSite: selected});
  }

  dsDNAhelpClicked(event:any, object: any){
    event.stopPropagation();
    const dialogRef = this.dialog.open(InfoPopupComponent, {
      data: {object: object},
    });
  }
}
