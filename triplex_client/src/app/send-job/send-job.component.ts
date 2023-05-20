import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TriplexServiceService } from '../services/triplex-service.service';
import { JobToSubmit } from '../model/jobToSubmit';

@Component({
  selector: 'app-send-job',
  templateUrl: './send-job.component.html',
  styleUrls: ['./send-job.component.css']
})
export class SendJobComponent {
  formGroup: FormGroup;
  ssRNAFile: File | undefined;
  dsDNAFile: File | undefined;
  constructor(private triplexService: TriplexServiceService) {
    this.formGroup = new FormGroup({
      ssRNA: new FormControl(null, [Validators.required]),
      dsDNA: new FormControl(null, [Validators.required]),
      jobName: new FormControl(null),
      email: new FormControl(null),
      min_len: new FormControl(null),
      max_len: new FormControl(null),
      error_rate: new FormControl(null),
      guanine_rate: new FormControl(null),
      filter_repeat : new FormControl(null),//on off
      consecutive_errors: new FormControl(null),
      SSTRAND: new FormControl(null)
    });
  }

  onRnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.ssRNAFile = input.files[0];
    }
  }
  onDnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.dsDNAFile = input.files[0];
    }
  }

  submitForm() {
    if (this.formGroup.valid && this.ssRNAFile && this.dsDNAFile) {
      console.log("Submit job...")
      console.log(this.ssRNAFile)
      console.log(this.formGroup.value);
      let job: JobToSubmit = {
        SSRNA_FASTA: this.ssRNAFile,
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
        console.log(response)
      }).catch(error => { console.log(error) });
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
