
import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlottableRepeat, Repeat } from '../model/repeats';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Observable } from 'rxjs/internal/Observable';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/internal/operators/map';

declare let Plotly: any;


interface DataForVisuals{
  job: any; available: any
}

@Component({
  selector: 'app-data-visualization',
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.css']
})
export class DataVisualizationComponent {
  token: string | null = null
  dataForVisuals: DataForVisuals | undefined = undefined
  profileData: any | undefined = undefined
  minStability: number = 0
  maxAvailableStability: number = 100
  loading: boolean = true
  updating: boolean = false
  maxStability: any = {}
  fullSequence: string[] = [];
  plotTraces: any[] = [];

  plotsLayout: any = {
    grid: {rows: 1, columns: 1},
    xaxis: {},
    legend: {"orientation": "h", x:0, y:1.1, bgcolor: '#E2E2E2',bordercolor: '#FFFFFF',borderwidth: 2},
    margin: {
      autoexpand: true
    }
  };
  height = 100;

  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute,
    private _router: Router){}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token'); 
    if (this.token != null) {
      this.triplexService.get_data_for_visualizations(this.token).then( (response:any) => {
        if (!response.success){
          this._router.navigate(['checkjob/token/', this.token]);
        } else {
          this.dataForVisuals = response.payload
          this.fullSequence = response.payload.available.sequence.split("")//.map((value:string, i:number) => i+"\n"+value)
          this.initializePlots()
        }
      })
    }
  }

  getDomain(N:number, i:number) {
    var spacing = 0.2
    return [
      (1 / N) * i + (i === 0 ? 0 : spacing / 2),
      (1 / N) * (i + 1) - (i === (N - 1) ? 0 : spacing / 2)
    ]
  }

  //This function is called once dataForVisuals has been retrieved
  async initializePlots(){
    const profile = this.initializeProfilePlot(this.dataForVisuals?.available?.tfo_profile);
    const secondaryStruct = this.initializeSecondaryStructurePlot(this.dataForVisuals?.available?.secondary_structure);
    const conservation = this.initializeConservationPlot();
    const repeats = this.initializeRepeatsPlot();
    const annotations: {
      text: string; font: { size: number; color: string; }; showarrow: boolean; align: string; x: number; //position in x domain
      y: number; //position in y domain
      xref: string; yref: string;
    }[] = []
    Promise.all([profile, secondaryStruct, conservation, repeats]).then(async (data) => {
      const repeats = data.pop();
      const plots = data.filter(x => x!=null);
      this.loading = false;
      plots.forEach((plot, index) => {
        const y = "y"+(index+1)
        plot.yaxis = y;
        /*if (index > 0){
          this.plotsLayout["yaxis"+(1+index)] = {
            domain: this.getDomain(plots.length + (repeats.size>0 ? 1 : 0), index)
          }
        } else {
          this.plotsLayout["yaxis"] = {
            domain: this.getDomain(plots.length + (repeats.size>0 ? 1 : 0), index)
          }
        }*/
        annotations.push({
            text: plot.name,
              font: {
              size: 16,
               color: 'black',
            },
            showarrow: false,
            align: 'center',
            x: 0.5, //position in x domain
            y: 1.05, //position in y domain
            yref: "y" + (index+1) + " domain",
            xref: 'paper'
          });
      });
      repeats?.forEach((repeatPlot:any, index:number) => {
        const y = "y"+(1+plots.length);
        repeatPlot.yaxis = y;
        this.plotsLayout["yaxis"+(1+plots.length+index)] = {
          fixedrange: true,
          visible: true,
          showticklabels: false,
        }
      });
      this.plotsLayout.grid.rows = plots.length;
      if (repeats?.length>0){
        this.plotsLayout["yaxis"+(1+plots.length)].title = {text:"Repeats"}
        //this.plotsLayout["yaxis"+(1+plots.length)].domain = this.getDomain(plots.length + 1, plots.length+1)
        
        this.plotsLayout.grid.rows = plots.length + 1;
        this.plotTraces = plots.concat(repeats);
        annotations.push({
          text: "Repeats",
            font: {
            size: 16,
             color: 'black',
          },
          showarrow: false,
          align: 'center',
          x: 0.5, //position in x domain
          y: 1.05, //position in y domain
          yref: "y" + (1+plots.length) + " domain",
          xref: 'paper',
        });
      } else {
        this.plotTraces = plots;
      }
      this.height = this.plotTraces.length*260;
      if (this.height > 760){this.height = 760;}
      await new Promise((r) => setTimeout(r, 100));
      this.plotsLayout.annotations = annotations;
      Plotly.newPlot('uniquePlotDiv', this.plotTraces, this.plotsLayout).then( (x:any) =>{
        let busy = false;
        let myDiv: any = document.getElementById("uniquePlotDiv");
        if (myDiv != null){
          myDiv.on("plotly_relayout", (eventdata:any) => {
            if (busy){
              busy = false; return;
            }
            busy = true;
            let oldLayout = myDiv.layout
            let l2 = Object.assign({}, oldLayout);
            l2.xaxis = this.getTicks([eventdata["xaxis.range[0]"], eventdata["xaxis.range[1]"] ]);
            Plotly.relayout("uniquePlotDiv", l2);
          });
        }
      })
      console.log(this.plotTraces);
    });
  }
  
  async updateProfilePlot(){
    this.updating = true;
    const new_plot: any[] = this.getDataForProfilePlot();
    this.plotTraces[0] = new_plot;
    await new Promise((r) => setTimeout(r, 100))
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout).then((x:any) => {
        this.updating = false;
      });
  }


  initializeSecondaryStructurePlot(path: string){
    if (!path){
      return null;
    }
    return this.triplexService.get_mspack_data(path).then((data:number[]) => {
      const plotlyData = {
        'x': Array.from({length: data.length}, (_, index) => index),
        'y': data, type: 'line', name: "Secondary structure",
        line: {
          color: "green"
        }
      }
      return plotlyData
    });
  }
  async initializeConservationPlot(){
    if (this.dataForVisuals?.available.conservation){
      const data = {
        'x': Array.from({length: this.dataForVisuals?.available.conservation.length}, (_, index) => index),
        'y': this.dataForVisuals?.available.conservation, type: 'line',  name: "Conservation",
      }
      return data;
    } else {
      return null;
    }
  }
  async initializeProfilePlot(urlToProfiles: string){
    return this.triplexService.get_mspack_data(urlToProfiles).then((data:any) => {
      this.profileData = data
      this.maxStability = this.profileData["best_stability"]
      return this.getDataForProfilePlot()
    })
  }
  getDataForProfilePlot(): any{
    let x: number[] = []; let y: number[] = []; let w: number[] = []; let t: string[] = []
    const profiles = this.profileData["profiles"]
    //Find position in the profiles object
    const stabilityValues = Object.keys(profiles)
    stabilityValues.sort((a, b) => +a - +b)
    let position = -1
    this.maxAvailableStability = +stabilityValues[stabilityValues.length-1]
    for (let i=0; i<stabilityValues.length; i++){
      if (+stabilityValues[i]>= this.minStability){
        position = i; break;
      }
    }
    if (position == -1){
      return {
        'x': x, 'y': y, 'with': w
      }
    }

    x.push(0); y.push(0); w.push(1); t.push("")
    let biggestX = 0
    profiles[String(stabilityValues[position])].forEach((element: any[]) => {
      x.push(element[1])
      if (element[1]> biggestX){
        biggestX = element[1]
      }
      y.push(element[0])
      if (element.length==2){
        w.push(1)
        t.push(element[1])
      } else {
        w.push(element[2])
        t.push(String(element[1]-(element[2]-1)/2) + "-" + String(element[1]+(element[2]-1)/2))
      }
    });
    const marker = {
      color: x.map((value:any) =>
        this.maxStability[Math.round( value )]
      ),
      colorscale: 'Portland',
      colorbar: {
        x: 0.9, y: 1, orientation:'h',
        title: "Max stability. (current th:" + this.minStability + ")", titleside:'top',
        thicknessmode:'pixels', thickness:20,
        lenmode:"pixels", len: 240,
        ticktext: [0, this.maxAvailableStability]
      }
    }
    x.push(biggestX+1); y.push(0); w.push(1);  t.push(""); marker.color.push(0)
    return {
      'x': x, 'y': y, 'with': w, type: 'bar',name: "TTF count", marker: marker, text: t,
      hovertemplate: '<b>Pos</b>: %{text}' +
                        '<br><b>TTF Count</b>: %{y}<br>',
                        textposition: "none"
    }
  }

  async initializeRepeatsPlot(){
    if (!this.dataForVisuals?.available.repeats?.length){
      return null;
    }
    const repeats: Repeat[] = this.dataForVisuals?.available.repeats.map(
      (r: any[]) => {
        const info = r[2].split(";")
        return {repClass: info[2], repName: info[0], repFamily:info[1],
        start: r[0], end: r[1]}
      })
    let max_size = this.fullSequence.length;
    const traces: any[] = PlottableRepeat.format_repeats_for_plotlt(repeats, max_size).map (
        (value: PlottableRepeat) => {
          return {
              x: value.xAxis, y: value.yAzis, mode: "lines+markers", type: "scatter", showlegend: false,
              connectgaps: false, name: "Repeats", text: value.text,
              line:{
                width:6
              },
              marker:{
                size: 6
              },
              hovertemplate: "<b>%{text}</b><br>X: %{x}<br>",
            }
        });
    return traces;
  }

  getTicks(range: number[] | null){
    if (range == null || range==undefined || range[0]==undefined || range[1]==undefined){
      return {range: [0, this.fullSequence.length]}
    }
    if (range[1]-range[0] >= 40){ 
        return {range: range}
      }
    const start = range[0];
    return {
        tickmode: "array",
        tickvals:  Array.from({length: 100}, (_, i) => start+i),
        ticktext:  this.fullSequence.slice(start-30, start+70),
        range: range
    }
  }
}
