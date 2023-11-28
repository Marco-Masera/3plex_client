import { Component, Input } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
declare let Plotly: any;

@Component({
  selector: 'app-dbd-details',
  templateUrl: './dbd-details.component.html',
  styleUrls: ['./dbd-details.component.css']
})
export class DbdDetailsComponent {
  @Input() dbd: number[] | null = null;
  @Input() stability: number | null = null;
  @Input() token: string | null = null;
  @Input() set setDbd(v: number[] | null){
    this.dbd = v;
    if (v){
      this.initializeDBDPage();
    }
  }
  @Input() profileLinearY: number[] = []
  @Input() randomizationAverage: number[] = []
  @Input() randomizationVariance: number[] = []
  @Input() set randomizationVariance_(v: number[]){
    this.randomizationVariance = v;
    this.initializeDBDPage();
  }
  @Input() fullSequence: string[] = []
  @Input() dsDNAID: string | null = null
  pValue:number = 0;
  tpx: any[] = [];
  loading = false;
  controller = new AbortController();
  signal = this.controller.signal;

  constructor(private triplexService: TriplexServiceService){}

  standardNormalCDF(x:number) {
    function erf(x:number) {
      const t = 1 / (1 + 0.5 * Math.abs(x));
      const erf = 1 - t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
      return x >= 0 ? erf : -erf;
    }
    const sqrt2 = Math.sqrt(2);
    return 0.5 * (1 + erf(x / (sqrt2)));
  }


  async generateTFFBBoxPlotForRandomized(){
    //If no statisticData or no selected DBD, return
    if (this.dbd==null || this.randomizationAverage.length == 0){return;}
    const dbd = this.dbd;
    //Get mean of TTF in profile
    const TTFs = this.profileLinearY.slice(dbd[0], dbd[1]+1);
    if (TTFs.length==0){return;}
    const mean = TTFs.reduce((a,b)=>a+b) / TTFs.length;
    //Get mean and standard deviation of TTFs in the randomizations
    const randomTTFMean = this.randomizationAverage.slice(dbd[0], dbd[1]+1).reduce((a,b)=>a+b) / (dbd[1]-dbd[0]+1);
    const randomTTFStDev = Math.sqrt(
      (
        this.randomizationVariance.slice(dbd[0], dbd[1]+1).reduce((a,b)=>a+b) +
        this.randomizationAverage.slice(dbd[0], dbd[1]+1).map(a => (a-randomTTFMean)**2).reduce((a,b)=>a+b)
        ) / (dbd[1]-dbd[0]+1)
      );
    //Compute p value
    this.pValue = 1 - this.standardNormalCDF(Math.abs(mean-randomTTFMean)/randomTTFStDev);
    //Generate plot
    var trace1 = {
      x: [''],
      y: [mean],
      name: 'Actual dsDNA',
      type: 'bar',
      hovertemplate: '<b>Average TTS: </b>: %{y}'
    };
    var trace2 = {
      x: [''],
      y: [randomTTFMean],
      name: 'Randomized dsDNA',
      error_y: {
        type: 'data',
        array: [randomTTFStDev],
        visible: true
      },
      type: 'bar',
      hovertemplate: '<b>Average TTS: </b>: %{y}<br><b>St.dev:</b>: %{error_y.array}<br>'
    };
    var data = [trace1, trace2];
    var layout = {barmode: 'group', height:250};
    await new Promise((r) => setTimeout(r, 100));
    Plotly.newPlot('boxplotDBD', data, layout);
  }

  initializeDBDPage(){
    console.log("Initializing DBD details page");
    this.generateTFFBBoxPlotForRandomized();
    const self = this;
    if (this.dbd && this.token){
      this.loading = true;
      this.tpx = [];
      this.controller.abort();
      this.triplexService.loadTPXInDBD(this.token, this.dbd[0], this.dbd[1], this.stability || 0, this.dsDNAID).then(
        response => {
          self.loading = false;
          if (response.success){
            self.tpx = response.payload.data;
          }
        }
      )
    }
  }

  toFixed(x:any) {
    if (isNaN(x)){return "Not defined";}
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          return '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

}
