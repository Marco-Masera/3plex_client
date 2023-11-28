import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute } from '@angular/router';
interface JobData{
  job_name: string | undefined,
  email_address: string | undefined,
  state: string,
  token: string,
  results: any | undefined
  date: string | undefined
  triplex_params: any | undefined,
  ssRNA_id: string | undefined,
  species: string | undefined
}

@Component({
  selector: 'app-checkjob',
  templateUrl: './checkjob.component.html',
  styleUrls: ['./checkjob.component.css']
})
export class CheckjobComponent {
  token: String | null = null
  jobData: JobData | undefined = undefined;
  onError: boolean = false
  errorMessage: string = ""
  files: string[] = []
  pollingTimer: any | null = null
  email_input: string = ""
  isUpdatingEmail: boolean = false;
  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute){}
  
  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token'); 
    this.route.params.subscribe(val => {
      this.token = this.route.snapshot.paramMap.get('token'); 
      if (this.token != null) {
        this.stopPolling()
        this.jobData = undefined; this.files = []
        this.onError = false; this.errorMessage = "";
        this.load_data();
        this.pollingTimer = setInterval(()=> { this.load_data() }, 40 * 1000);
      }
   });
  }

  mailInputInvalid(){
    return !(this.email_input && new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$').test(this.email_input) )
  }

  updateEmail(){
    if (this.isUpdatingEmail){return;}
    this.isUpdatingEmail = true;
    this.triplexService.updateJobMail(this.jobData?.token || "", this.email_input).then(
      (response: any) => {
        if (this.jobData){
          this.jobData.email_address = this.email_input;
        }
        this.isUpdatingEmail = false;
      }
    ).catch(
      (response: any) => {console.log(response); window.alert("Could not set email address"); this.isUpdatingEmail = false;}
    );
  }

  downloadFile(file: String){
    
  }

  stopPolling(){
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  }

  triplex_params(){
    if (!this.jobData || !this.jobData.triplex_params){
      return []
    }
    let r: any[][] = []
    Object.keys(this.jobData.triplex_params).forEach((elem) => {
      r.push([elem, this.jobData?.triplex_params[elem]])
    })
    return r;
  }

  load_data(){
    if (this.onError || (this.jobData && !(this.jobData.state=="Submitted"))){
      this.stopPolling();
      return;
    }
    console.log("Loading data")
    if (this.token != null){
      this.triplexService.checkJob(this.token).then(
        (response: any) => {
          console.log(response);
          if (response.success){
            this.jobData = {
              species: response.payload.job.species,
              job_name: response.payload.job.job_name,
              email_address: response.payload.job.email_address,
              //state: "Submitted",// response.payload.job.state,
              state: response.payload.job.state,
              token: response.payload.job.token,
              ssRNA_id: response.payload.job.ssRNA_id,
              results: response.payload.results,
              date: response.payload.job.date,
              triplex_params: response.payload.params.map((param: string[]) => {
                if (param[0]=="SSTRAND "){param[0] = "ssRNA secondary structure";}
                return param;
              })
            }
            this.files = Object.keys(this.jobData.results)
            let BASE_URL = this.triplexService.getBaseUrl()
            BASE_URL = BASE_URL.substring(0, BASE_URL.length - 1);
            for (let elem of this.files){
              this.jobData.results[elem] = BASE_URL+this.jobData.results[elem]
            }
            this.onError = false;
          } else {
            this.onError = true; this.errorMessage = response.error;
          }
        }
      ).catch(
        (response: any) => {this.onError = true; this.errorMessage = response.error;}
      )
    } else {
      this.onError = true;
    }
  }

  goToVisuals(){
    window.open("/data_visualization/" + this.token)
  }
}