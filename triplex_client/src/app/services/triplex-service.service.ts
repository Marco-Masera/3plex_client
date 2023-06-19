import { Injectable } from '@angular/core';
import { JobToSubmit } from '../model/jobToSubmit';
import { LncRnaTranscript } from '../model/lnc_rna_transcript';
import { encode, decode } from "@msgpack/msgpack";
import { DnaTargetSites } from '../model/dna_target_sites';

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

  get_triplex_default_params(){
    return this.get_data("api/3plex_default_params");
  }

  submitJob(jobToSubmit: JobToSubmit){
    const formData = new FormData();
    
    // Append files to the form data object
    if (jobToSubmit.SSRNA_FASTA){
      formData.append('SSRNA_FASTA', jobToSubmit.SSRNA_FASTA);
    } else if (jobToSubmit.SSRNA_STRING){
      formData.append('SSRNA_STRING', jobToSubmit.SSRNA_STRING);
    } else if (jobToSubmit.SSRNA_TRANSCRIPT_ID){
      formData.append('SSRNA_ID', jobToSubmit.SSRNA_TRANSCRIPT_ID);
    }
    if (jobToSubmit.DSDNA_FASTA){
      formData.append('DSDNA_FASTA', jobToSubmit.DSDNA_FASTA);
    } else if (jobToSubmit.DSDNA_BED){
      formData.append('DSDNA_COORD_BED', jobToSubmit.DSDNA_BED);
    } else if (jobToSubmit.DSDNA_TARGET_NAME){
      formData.append("DSDNA_TARGET_NAME", jobToSubmit.DSDNA_TARGET_NAME)
    }

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

  //Retrieve LncRnaTranscript objects by query
  get_lncrna_transcripts_from_query(query: string, species:string, max_elems: number): Promise<LncRnaTranscript[]>{
    return this.get_data("api/search/transcripts/" + species + "/" +query + "?max_elems="+ max_elems).then( r => {
      if (r.success)
        return r.payload.map( (elem: any) => new LncRnaTranscript(elem))
      return []
    })
  }

  get_dna_targets(): Promise<any>{
    return this.get_data("api/dnatargetsites").then( r => {
      if (r.success){
        let d: { [species: string]: DnaTargetSites[] } = {}
        r.payload.forEach((element:any) => {
          let t = new DnaTargetSites(element);
          if (d[t.species]){
            d[t.species].push(t)
          } else {
            d[t.species] = [t]
          }
        });
        return d;
      }
      return []
    })
  }

  get_data_for_visualizations(token: string): any{
    return this.get_data("api/data_for_visuals/"+token)
  }

  get_mspack_data(url: string): any{
    const filePath = this.getBaseUrl().slice(0,-1) + url
    return fetch(filePath)
    .then(response => response.arrayBuffer())
    .then(buffer => decode(buffer));
  }

  get_allowed_species(): any{
    return this.get_data("api/system_allowed_species");
  }
}
