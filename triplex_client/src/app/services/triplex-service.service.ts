import { Injectable } from '@angular/core';
import { JobToSubmit } from '../model/jobToSubmit';
import { LncRnaTranscript } from '../model/lnc_rna_transcript';
import { encode, decode } from "@msgpack/msgpack";
import { DnaTargetSites } from '../model/dna_target_sites';
import { isDevMode } from '@angular/core';

if (isDevMode()){
  console.log("Initialize urls in dev mode")
  var BASE_URL="http://192.168.99.164:80/"
  var API_PATH = "debug/api/" 
} else {
  var BASE_URL="https://www.3plex.unito.it/"
  var API_PATH = "api/"
}

@Injectable({
  providedIn: 'root'
})
export class TriplexServiceService {
  constructor() { }
  //Generic method to fetch some data
  get_data(url: String, signal:any = null){
    return fetch(BASE_URL+API_PATH+url, { signal }).then(
      async (response:any) => {
        response = await response.json()
        response = await JSON.parse(response)
        return response
      }
    )
  }
  //Generic method to post data
  post_data(url: String, body: any){
    return fetch(BASE_URL+API_PATH+url, {
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
    return fetch(BASE_URL+API_PATH+url, {
      method: "POST",
      mode: "cors",  
      body: body,
    }).then(
      async (response:any) => {
        response = await response.json()
        response = await JSON.parse(response)
        return response
      }
    )
  }

  checkJob(token: String){
    return this.get_data("checkjob/"+token)
  }

  checkJobsMyEmail(email: String){
    return this.get_data("checkjobs/email/"+email)
  }

  get_triplex_default_params(){
    return this.get_data("3plex_default_params");
  }

  submitJobPromoterTest(jobToSubmit: any){
    const formData = new FormData();
    //ssRNA input:
    if (jobToSubmit.SSRNA_FASTA){
      formData.append('SSRNA_FASTA', jobToSubmit.SSRNA_FASTA);
    } else if (jobToSubmit.SSRNA_STRING){
      formData.append('SSRNA_STRING', jobToSubmit.SSRNA_STRING);
    } else if (jobToSubmit.SSRNA_TRANSCRIPT_ID){
      formData.append('SSRNA_ID', jobToSubmit.SSRNA_TRANSCRIPT_ID);
    }
    //Genes
    formData.append('interest_genes', jobToSubmit.INTEREST_GENES);
    formData.append('all_genes', jobToSubmit.ALL_GENES);
    //Generic job info
    if (jobToSubmit.SPECIES){
      formData.append('SPECIES', jobToSubmit.SPECIES);
    }
    if (jobToSubmit.JOBNAME !== undefined) {
      formData.append('JOBNAME', String(jobToSubmit.JOBNAME));
    }
    if (jobToSubmit.EMAIL !== undefined) {
      formData.append('EMAIL', String(jobToSubmit.EMAIL));
    }
    //3plex params
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
    return this.post_data_form("submit_promoter_test/", formData) 
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
    
    if (jobToSubmit.SPECIES){
      formData.append('SPECIES', jobToSubmit.SPECIES);
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
    if (jobToSubmit.USE_RANDOM && jobToSubmit.USE_RANDOM > 0){
      formData.append('USE_RAND', String(jobToSubmit.USE_RANDOM));
    }
    return this.post_data_form("submitjob/", formData) 
  }

  getBaseUrl(){
    return BASE_URL
  }
  getAPIUrl(){
    return API_PATH
  }

  //Retrieve LncRnaTranscript objects by query
  get_lncrna_transcripts_from_query(query: string, species:string, max_elems: number): Promise<LncRnaTranscript[]>{
    return this.get_data("search/transcripts/" + species + "/" +query + "?max_elems="+ max_elems).then( r => {
      if (r.success)
        return r.payload.map( (elem: any) => new LncRnaTranscript(elem))
      return []
    })
  }

  get_dna_targets(): Promise<any>{
    return this.get_data("dnatargetsites").then( r => {
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

  get_data_for_visualizations(token: string, dsDNAID: string | null): any{
    if (dsDNAID){
      return this.get_data("data_for_visuals/"+token+ "?dsDNAID="+dsDNAID);
    } else {
      return this.get_data("data_for_visuals/"+token);
      }
  }

  get_mspack_data(url: string): any{
    return this.get_mspack_data_no_url(BASE_URL.slice(0,-1) + url);
  }
  get_mspack_data_no_url(url: string): any{
    return fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => decode(buffer));
  }

  get_allowed_species_and_iterations(): any{
    return this.get_data("system_allowed_species_and_iterations");
  }

  updateJobMail(token: string, email: string): any{
    const url = "jobs/" + token + "/mail/" + email;
    return fetch(BASE_URL+API_PATH+url, {
      method: "POST", 
      mode: "no-cors", 
      cache: "no-cache", 
      credentials: "same-origin", 
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer", 
      body: null,
    })
  }

  loadTPXInDBD(token: string, start: number, end: number, stability: number, dsDNAID: string | null, signal:any=null){
    const queryParam = dsDNAID ? `?dsdnaid=${dsDNAID}` : ""
    return this.get_data(`tts_sites/${token}/${start}/${end}/${stability}`+queryParam, signal)
  }

  getDBD(token: string){
    return this.get_data(`dbd/${token}`);
  }
  setDBD(token: string, dbds: number[][]){
    const url = `dbd/${token}`;
    const formData = new FormData();
    formData.append('dbds', JSON.stringify(dbds));
    this.post_data_form(url, formData) 
  }

  getWebSummary(token: string){
    return this.get_data(`jobs/${token}/websummary`)
  }

  getUCSCLink(token: string, dsDNA_id: string, stability: string){
    return this.get_data(`jobs/${token}/${dsDNA_id}/${stability}/profile_ucsc`)
  }

  downloadTPXInExcel(token: string, dsDNA_id: string | null, stability: number, start: number | null, end: number | null){
    console.log(stability)
    const queries: string[] = []
    if (dsDNA_id){ queries.push(`dsDNAID=${dsDNA_id}`);}
    if (stability != null){ queries.push(`stability=${stability}`);}
    if (start != null){ queries.push(`start=${start}`);}
    if (end != null){ queries.push(`end=${end}`);}
    var queryString = queries.join("&");
    window.open(BASE_URL+API_PATH+`jobs/${token}/tpx.xlsx?${queryString}`);
  }

  fetchExportJobUrl(token: string){
    return this.get_data(`jobs/${token}/export_data`);
  }

  importJob(token:string, file: File){
    const url = `jobs/${token}/export_data`
    const formData = new FormData();
    formData.append('TARBALL', file);
    return this.post_data_form(url, formData) 
  }

}
