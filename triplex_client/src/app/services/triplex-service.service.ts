import { Injectable } from '@angular/core';
import { JobToSubmit } from '../model/jobToSubmit';

const BASE_URL="http://192.168.186.10:8001/"

@Injectable({
  providedIn: 'root'
})
export class TriplexServiceService {
  constructor() { }
  //Generic method to fetch some data
  get_data(url: String){
    return fetch(BASE_URL+url).then(
      async (response:any) => {
        response = await response.json()
        response = await JSON.parse(response)
        return response
      }
    )
  }
  //Generic method to post data
  post_data(url: String, body: any){
    return fetch(BASE_URL+url, {
      method: "POST", 
      mode: "no-cors", 
      cache: "no-cache", 
      credentials: "same-origin", 
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer", 
      body: JSON.stringify(body),
    }).then(
      async (response:any) => {
        response = await response.json()
        response = await JSON.parse(response)
        return response
      }
    )
  }

  //Post data with body as FormData
  post_data_form(url: String, body: any){
    return fetch(BASE_URL+url, {
      method: "POST",
      mode: "cors",  
      body: body,
    }).then(
      async (response:any) => {
        console.log(response)
        response = await response.json()
        response = await JSON.parse(response)
        return response
      }
    )
  }

  checkJob(token: String){
    return this.get_data("api/checkjob/"+token)
  }

  checkJobsMyEmail(email: String){
    return this.get_data("api/checkjobs/email/"+email)
  }

  submitJob(jobToSubmit: JobToSubmit){
    const formData = new FormData();
    
    // Append files to the form data object
    if (jobToSubmit.SSRNA_FASTA){
      formData.append('SSRNA_FASTA', jobToSubmit.SSRNA_FASTA);
    } else if (jobToSubmit.SSRNA_STRING){
      formData.append('SSRNA_STRING', jobToSubmit.SSRNA_STRING);
    }
    formData.append('DSDNA_FASTA', jobToSubmit.DSDNA_FASTA);

    if (jobToSubmit.JOBNAME !== undefined) {
      formData.append('JOBNAME', String(jobToSubmit.JOBNAME));
    }
    if (jobToSubmit.EMAIL !== undefined) {
      formData.append('EMAIL', String(jobToSubmit.EMAIL));
    }
    if (jobToSubmit.min_len !== undefined) {
      formData.append('min_len', String(jobToSubmit.min_len));
    }
    if (jobToSubmit.max_len !== undefined) {
      formData.append('max_len', String(jobToSubmit.max_len));
    }
    if (jobToSubmit.error_rate !== undefined) {
      formData.append('error_rate', String(jobToSubmit.error_rate));
    }
    if (jobToSubmit.guanine_rate !== undefined) {
      formData.append('guanine_rate', String(jobToSubmit.guanine_rate));
    }
    if (jobToSubmit.filter_repeat !== undefined) {
      formData.append('filter_repeat', String(jobToSubmit.filter_repeat));
    }
    if (jobToSubmit.consecutive_errors !== undefined) {
      formData.append('consecutive_errors', String(jobToSubmit.consecutive_errors));
    }
    if (jobToSubmit.SSTRAND !== undefined) {
      formData.append('SSTRAND', String(jobToSubmit.SSTRAND));
    }
    console.log(formData)
    return this.post_data_form("api/submitjob/", formData) 
  }

  getBaseUrl(){
    return BASE_URL
  }
}
