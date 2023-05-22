import { Component } from '@angular/core';
import { Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { JobToSubmit } from '../model/jobToSubmit';
import { Router } from '@angular/router';

function atLeastOneRequired(control: AbstractControl): { [key: string]: boolean } | null {
  const ssRNAValue: String | null = control.get('ssRNA')?.value;
  const ssRNATextual = control.get('ssRNATextual')?.value;
  if (!ssRNAValue && !ssRNATextual) {
    return { atLeastOneRequired: true };
  }
  return null;
}

@Component({
  selector: 'app-send-job',
  templateUrl: './send-job.component.html',
  styleUrls: ['./send-job.component.css']
})
export class SendJobComponent {
  formGroup: FormGroup;
  ssRNAFile: File | undefined;
  dsDNAFile: File | undefined;
  sending: boolean = false;
  constructor(private triplexService: TriplexServiceService, private _router: Router) {
    this.formGroup = new FormGroup({
      ssRNA: new FormControl(null),
      ssRNATextual: new FormControl(null),
      dsDNA: new FormControl(null),
      jobName: new FormControl(null),
      email: new FormControl(null),
      min_len: new FormControl(null),
      max_len: new FormControl(null),
      error_rate: new FormControl(null),
      guanine_rate: new FormControl(null),
      filter_repeat : new FormControl(null),//on off
      consecutive_errors: new FormControl(null),
      SSTRAND: new FormControl(null)
    }, { validators: atLeastOneRequired });
  }

  reset_selected_ssRNA(){
    this.formGroup.patchValue({ssRNA: null});
    this.ssRNAFile = undefined;
  }
  reset_selected_dsDNA(){
    this.formGroup.patchValue({dsDNA: null});
    this.dsDNAFile = undefined;
  }


  onRnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.formGroup.patchValue({ssRNATextual: null});
      this.ssRNAFile = input.files[0];

    }
  }
  onDnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.dsDNAFile = input.files[0];
    }
  }

  onSuccess(response: any){
    this._router.navigate(['checkjob/token/', response.payload.token.token]);
  }

  onFailure(response: any){
    window.alert("Cannot submit job: " + response.error);
  }

  submitForm() {
    if (this.sending){return;}
    this.sending = true;
    if (this.formGroup.valid && (this.ssRNAFile || this.formGroup.value.ssRNATextual) && this.dsDNAFile) {
      console.log("Submit job...")
      let job: JobToSubmit = {
        SSRNA_FASTA: this.ssRNAFile,
        SSRNA_STRING: this.formGroup.value.ssRNATextual,
        DSDNA_FASTA: this.dsDNAFile,
        JOBNAME: this.formGroup.value.jobName || undefined,
        EMAIL: this.formGroup.value.email || undefined,
        min_len: this.formGroup.value.min_len || undefined,
        max_len: this.formGroup.value.max_len || undefined,
        error_rate: this.formGroup.value.error_rate || undefined,
        guanine_rate: this.formGroup.value.guanine_rate || undefined,
        filter_repeat: this.formGroup.value.filter_repeat || undefined,
        consecutive_errors: this.formGroup.value.consecutive_errors || undefined,
        SSTRAND: this.formGroup.value.SSTRAND || undefined
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

  reset_triplex_params(){
    this.formGroup.patchValue({
      min_len: null,
      max_len: null,
      error_rate: null,
      guanine_rate: null,
      filter_repeat: null,
      consecutive_errors: null
    });
  }
}
