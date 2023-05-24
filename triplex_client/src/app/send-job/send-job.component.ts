import { Component } from '@angular/core';
import { Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { JobToSubmit } from '../model/jobToSubmit';
import { Router } from '@angular/router';

const ssRNAMaxSize = 1;
const dsDNAMaxSize = 300;

function atLeastOneRequired(control: AbstractControl): { [key: string]: boolean } | null {
  const ssRNAValue: String | null = control.get('ssRNA')?.value;
  const ssRNATextual = control.get('ssRNATextual')?.value;
  if (!ssRNAValue && !ssRNATextual) {
    return { atLeastOneRequired: true };
  }
  return null;
}

interface triplex_param_descr{
  default: string; description: string
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
  default_triplex_params: any

  ssRNAToolTip = "A single ssRNA sequence - either provided as a single fasta file or as simple text (max size: " + ssRNAMaxSize + " MB)."
  dsDNAToolTip = "A multi-FASTA file containing one or multiple dsDNA sequences (max size: " + dsDNAMaxSize + " MB)."

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

  ngOnInit(){
    this.triplexService.get_triplex_default_params().then( response => {
      if (response.success){
        this.default_triplex_params = response.payload
        this.formGroup.patchValue({filter_repeat: this.default_triplex_params?.filter_repeat.default});
        console.log(this.default_triplex_params)
      }
    })
  }

  get_triplex_params_default_value(param: string): string{
    let to_ret: any | undefined;
    if (this.default_triplex_params)
      to_ret = this.default_triplex_params[param]?.default
    if (to_ret !== undefined){
      return to_ret
    }
    return ""
  }
  get_triplex_param_l_b(param: string): string{
    return this.default_triplex_params?.[param]?.bounds?.[0] ?? -9999999
  }
  get_triplex_param_h_b(param: string): string{
    return this.default_triplex_params?.[param]?.bounds?.[1] ?? 9999999
  }
  get_triplex_params_description(param: string): string{
    if (this.default_triplex_params)
      return this.default_triplex_params[param]?.description || ""
    return ""
  }

  reset_selected_ssRNA(){
    this.formGroup.patchValue({ssRNA: null});
    this.ssRNAFile = undefined;
  }
  reset_selected_dsDNA(){
    this.formGroup.patchValue({dsDNA: null});
    this.dsDNAFile = undefined;
  }

  checkFileFastaFormat(file: File): boolean{
    return file.name.split(".").pop()=="fa"
  }

  onRnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (input.files[0].size > ssRNAMaxSize*1000000 ){
        window.alert("Your input file exceed maximum file size of " + ssRNAMaxSize + " MB")
        this.formGroup.patchValue({ssRNA: null});
      } else {
        if (!this.checkFileFastaFormat(input.files[0])){
          window.alert("Please provide a file in FASTA format (.fa)")
          this.formGroup.patchValue({ssRNA: null});
        } else {
          this.formGroup.patchValue({ssRNATextual: null});
          this.ssRNAFile = input.files[0];
        }
      }
    }
  }
  onDnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (input.files[0].size > dsDNAMaxSize*1000000){
        window.alert("Your input file exceed maximum file size of " + dsDNAMaxSize + " MB")
        this.formGroup.patchValue({dsDNA: null});
      } else {
        if (!this.checkFileFastaFormat(input.files[0])){
          window.alert("Please provide a file in FASTA format (.fa)")
          this.formGroup.patchValue({dsDNA: null});
        } else {
          this.dsDNAFile = input.files[0];
        }
      }
    }
  }

  onSuccess(response: any){
    this._router.navigate(['checkjob/token/', response.payload.token.token]);
  }

  onFailure(response: any){
    window.alert("Cannot submit job: " + response.error);
  }

  submitForm() {if (this.sending){return;}
    if (this.formGroup.valid && (this.ssRNAFile || this.formGroup.value.ssRNATextual) && this.dsDNAFile) {
      console.log("Submit job...")
      this.sending = true;
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
      filter_repeat: this.default_triplex_params?.filter_repeat.default,
      consecutive_errors: null
    });
  }
}
