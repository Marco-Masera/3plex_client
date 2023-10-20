import { Component, Input } from '@angular/core';
declare let Plotly: any;

@Component({
  selector: 'app-dbd-details',
  templateUrl: './dbd-details.component.html',
  styleUrls: ['./dbd-details.component.css']
})
export class DbdDetailsComponent {
  dbd: number[] | null = null;
  @Input() set setDbd(v: number[] | null){
    this.dbd = v;
    if (v){
      this.generateTFFBBoxPlotForRandomized();
    }
  }
  @Input() profileLinearY: number[] = []
  @Input() randomizationAverage: number[] = []
  @Input() randomizationVariance: number[] = []
  @Input() set randomizationVariance_(v: number[]){
    this.randomizationVariance = v;
    this.generateTFFBBoxPlotForRandomized();
  }
  pValue:number = 0;

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
      hovertemplate: '<b>Average TTF: </b>: %{y}'
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
      hovertemplate: '<b>Average TTF: </b>: %{y}<br><b>St.dev:</b>: %{error_y.array}<br>'
    };
    var data = [trace1, trace2];
    var layout = {barmode: 'group', height:300};
    await new Promise((r) => setTimeout(r, 100));
    Plotly.newPlot('boxplotDBD', data, layout);
  }

}
