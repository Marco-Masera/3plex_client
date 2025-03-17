import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TriplexServiceService } from 'src/app/services/triplex-service.service';
import { LncRnaTranscript } from '../../model/lnc_rna_transcript';

@Component({
  selector: 'app-jss-rna-field',
  templateUrl: './jss-rna-field.component.html',
  styleUrls: ['./jss-rna-field.component.css']
})
export class JssRNAFieldComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() sending: boolean = false;
  @Input() ssRNAMaxSize: number = 1;
  ssRNAFile: File | undefined;
  @Output() ssRNAFile_emitter: EventEmitter<any> = new EventEmitter();
  ssRNAToolTip = "A single ssRNA sequence - either chosen from our transcript's database or provided as a single fasta file or as simple text (max size: " + this.ssRNAMaxSize + " MB)."

  transcriptSearchGetQuery: ((query: string) => Promise<LncRnaTranscript[]>) | undefined = undefined;

  constructor(private triplexService: TriplexServiceService){}

  ngOnInit(){
    const service = this.triplexService;
    const self = this;
    this.transcriptSearchGetQuery = function(query: string){
      return service.get_lncrna_transcripts_from_query(query, self.formGroup.value.selected_species, 30)
    }
  }

  transcriptSearchSelectOption(selected: LncRnaTranscript){
    this.formGroup.patchValue({ssRNA_transcript_id: selected.id});
    //If no job name specified, add the filename
    if (!this.formGroup.value.jobName){
      this.formGroup.patchValue({jobName: selected.toString()});
    }
  }

  pathToName(path: string|null|undefined): string|undefined{
    if (!path) return "";
    var filename = path.replace(/^.*[\\\/]/, '')
    return filename.split("\\").pop();
  }

  reset_selected_ssRNA(){
    this.formGroup.patchValue({ssRNA: null});
    this.ssRNAFile_emitter.emit(undefined);
  }

  onRnaChange(event: Event){
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      if (input.files[0].size > this.ssRNAMaxSize*1000000 ){
        window.alert("Your input file exceed maximum file size of " + this.ssRNAMaxSize + " MB")
        this.formGroup.patchValue({ssRNA: null});
      } else {
        if (!this.checkFileFastaFormat(input.files[0])){
          window.alert("Please provide a file in FASTA format (.fa)")
          this.formGroup.patchValue({ssRNA: null});
        }else if (!this.validateFileName(input.files[0].name)){
          window.alert("Invalid file name: allowed characters are a-z, A-Z, 0-9, and - _ . symbols")
          this.formGroup.patchValue({ssRNA: null});
        } else {
          const oldName = this.ssRNAFile?.name
          this.formGroup.patchValue({ssRNATextual: null});
          this.ssRNAFile = input.files[0];
          this.ssRNAFile_emitter.emit(this.ssRNAFile)
          //If no job name specified, add the filename
          if (!this.formGroup.value.jobName || this.formGroup.value.jobName == oldName){
            this.formGroup.patchValue({jobName: this.ssRNAFile.name});
          }
        }
      }
    }
  }

  checkFileFastaFormat(file: File | undefined): boolean{
    return file?.name.split(".").pop()=="fa" ?? false
  }
  validateFileName(fileName: string): boolean{
    const regex = /^[a-zA-Z0-9_.-]+$/;
    return regex.test(fileName);
  }
}
