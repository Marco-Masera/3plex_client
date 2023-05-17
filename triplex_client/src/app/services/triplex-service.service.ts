import { Injectable } from '@angular/core';

const BASE_URL="http://192.168.186.10:8000/"

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
      mode: "cors", 
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
}
