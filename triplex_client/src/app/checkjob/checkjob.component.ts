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
  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute){}
  
  ngOnInit() {this.token = this.route.snapshot.paramMap.get('token'); if (this.token != null) {this.load_data();}}

  downloadFile(file: String){

  }

  load_data(){
    if (this.token != null){
      this.triplexService.checkJob(this.token).then(
        (response: any) => {
          console.log(response);
          if (response.success){
            this.jobData = {
              job_name: response.payload.job.job_name,
              email_address: response.payload.job.email_address,
              state: response.payload.job.state,
              token: response.payload.job.token,
              results: response.payload.results,
              date: response.payload.job.date
            }
            this.files = Object.keys(this.jobData.results)
            let BASE_URL = this.triplexService.getBaseUrl()
            BASE_URL = BASE_URL.substring(0, BASE_URL.length - 1);
            for (let elem of this.files){
              this.jobData.results[elem] = BASE_URL+this.jobData.results[elem]
            }
            console.log(this.jobData)
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
}