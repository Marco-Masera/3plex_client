import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute } from '@angular/router';

interface JobsData{
  job_name: string | undefined,
  email_address: string | undefined,
  state: string,
  token: string,
  date: string | undefined
  link_: string | undefined
}

@Component({
  selector: 'app-check-by-email',
  templateUrl: './check-by-email.component.html',
  styleUrls: ['./check-by-email.component.css']
})
export class CheckByEmailComponent {
  email: String | null = null
  jobsData: JobsData[] | undefined = undefined;
  onError: boolean = false
  errorMessage: string = ""
  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute){}
  
  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email');
    if (this.email != null) {this.load_data();}

    this.route.params.subscribe(val => {
      this.email = this.route.snapshot.paramMap.get('email');
      if (this.email != null) {this.load_data();}
   });
  
  }

  navigate(link: string | undefined){
    if (link != undefined){
      window.open(link, "_blank");
    }
  }

  load_data(){
    if (this.email != null){
      this.triplexService.checkJobsMyEmail(this.email).then(
        (response: any) => {
          if (response.success){
            this.jobsData = response.payload;
            for(let job of this.jobsData || []){
              job.link_ = "checkjob/token/" + job.token;
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
}
