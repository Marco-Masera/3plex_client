import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlottableRepeat, Repeat } from '../model/repeats';
import { repeat } from 'rxjs';
import { PathLocationStrategy } from '@angular/common';

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
  secondaryStructureData: number[] | undefined
  profileGraphDiv: any | undefined = undefined
  minStability: number = 0
  maxAvailableStability: number = 100
  loading: boolean = false
  maxStability: any = {}
  graphBusy: any = {}


  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute,
    private _router: Router){}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token'); 
    if (this.token != null) {
      this.triplexService.get_data_for_visualizations(this.token).then( (response:any) => {
        if (!response.success){
          //Redirect to check job
          this._router.navigate(['checkjob/token/', this.token]);
        } else {
          this.dataForVisuals = response.payload
          this.initializePlots()
        }
      })
    }
  }

  //This function is called once dataForVisuals has been retrieved
  initializePlots(){
    this.initializeProfilePlot(this.dataForVisuals?.available?.tfo_profile);
    this.initializeSecondaryStructurePlot(this.dataForVisuals?.available?.secondary_structure);
    this.initializeConservationPlot();
    this.initializeRepeatsPlot();
  }

  initializeSecondaryStructurePlot(path: string){
    if (!path){
      return;
    }
    this.triplexService.get_mspack_data(path).then((data:number[]) => {
      this.secondaryStructureData = data;
      const layout = {
        yaxis: {
          tickformat: '.3f'
        }, margin:{b: 30, t: 5, l:0,r:0},height: 240
      }
      const plotlyData = {
        'x': Array.from({length: data.length}, (_, index) => index),
        'y': data, type: 'line',
        line: {
          color: "green"
        }
      }
      Plotly.newPlot('plotDivSecondaryStructure', [plotlyData], layout).then((x:any) => {
        let myDiv: any = document.getElementById("plotDivSecondaryStructure");
        if (myDiv != null){
          myDiv.on("plotly_relayout", (eventdata:any) => {
            this.graph_changed_zoom_callback("plotDivSecondaryStructure", eventdata);
          });
        }
      })
    })
  }

  graph_changed_zoom_callback(plot_div: string, eventdata: any){
    if (this.graphBusy[plot_div]){
      this.graphBusy[plot_div] = false;
      return;
    }
    console.log("Agent: " + plot_div + ", zoom: " + eventdata["xaxis.range[0]"] + "-" + eventdata["xaxis.range[1]"])
    const plots = ["plotDiv","plotDivConservation","plotDivRepeats", "plotDivSecondaryStructure"]
    plots.forEach( (plot: string)=> {
      if (plot != plot_div){
        const div:any = document.getElementById(plot);
        let oldLayout = div.layout
        if (oldLayout && eventdata){
          console.log(div)
          console.log("Target:" + plot)
          oldLayout.xaxis.range[0] = eventdata["xaxis.range[0]"]
          oldLayout.xaxis.range[1] = eventdata["xaxis.range[1]"]
          this.graphBusy[plot] = true;
          Plotly.relayout(plot, oldLayout);
        }
      }
    })
  }

  async initializeRepeatsPlot(){
    const repeats: Repeat[] = this.dataForVisuals?.available.repeats.map(
      (r: any[]) => {
        const info = r[2].split(";")
        return {repClass: info[2], repName: info[0], repFamily:info[1],
        start: r[0], end: r[1]}
      })
    let max_size = this.dataForVisuals?.available.conservation.length;
    const traces: any[] = PlottableRepeat.format_repeats_for_plotlt(repeats, max_size).map (
        (value: PlottableRepeat) => {
          return {
              x: value.xAxis, y: value.yAzis, mode: "lines+markers", type: "scatter", 
              connectgaps: false, name: value.repClass, text: value.text,
              line:{
                width:8
              },
              marker:{
                size: 8
              },
              hovertemplate: "<b>%{text}</b><br>X: %{x}<br>"
            }
        })
    const layout = {
          yaxis: {
            fixedrange: true,
            visible: false,
            showticklabels: false,
          },
          xaxis: {
            showline: false,
            zeroline: false
          },  margin:{b: 30, t: 5, l:0,r:0},height: 240
        };
    Plotly.newPlot('plotDivRepeats', traces, layout).then((x:any) => {
      let myDiv: any = document.getElementById("plotDivRepeats");
      if (myDiv != null){
        myDiv.on("plotly_relayout", (eventdata:any) => {
          this.graph_changed_zoom_callback("plotDivRepeats", eventdata);
        });
      }
    })
  }

  async initializeConservationPlot(){
    if (this.dataForVisuals?.available.conservation){
      const layout = {
        yaxis: {autorange: true, fixedrange: true}, margin:{b: 30, t: 5, l:0,r:0},height: 240
      }
      const data = {
        'x': Array.from({length: this.dataForVisuals?.available.conservation.length}, (_, index) => index),
        'y': this.dataForVisuals?.available.conservation, type: 'line',
      }
      Plotly.newPlot('plotDivConservation', [data], layout).then((x:any) => {
        let myDiv: any = document.getElementById("plotDivConservation");
        if (myDiv != null){
          myDiv.on("plotly_relayout", (eventdata:any) => {
            this.graph_changed_zoom_callback("plotDivConservation", eventdata);
          });
        }
      })
    }
  }

  async initializeProfilePlot(urlToProfiles: string){
    this.triplexService.get_mspack_data(urlToProfiles).then((data:any) => {
      this.profileData = data
      this.getMaxStabilityShapes()
      this.drawProfilePlot()
    })
  }

  async drawProfilePlot(){
    const data: any[] = this.getDataForProfilePlot()
    await new Promise((r) => setTimeout(r, 20))
    if (this.profileGraphDiv==undefined){
      const layout = {
        yaxis: {title: 'TFO Count'}, margin:{b: 30, t: 5, l:0,r:0},height: 320
      }
      Plotly.newPlot('plotDiv', [data], layout, {responsive: true}).then((x:any) => {
        this.loading = false;
        this.profileGraphDiv = document?.getElementById('plotDiv')
        this.profileGraphDiv.on("plotly_relayout", (eventdata:any) => {
            this.graph_changed_zoom_callback("plotDiv", eventdata);
        });
      })
    } else {
      let oldRange = this.profileGraphDiv.layout.xaxis.range;
      const layout = {
        yaxis: {title: 'TFO Count'}, xaxis: {range: oldRange}, margin:{b: 30, t: 5, l:0,r:0},height: 320
      }
      Plotly.react('plotDiv', [data], layout).then((x:any) => {
        this.loading = false;
      });
    }
  }

  getMaxStabilityShapes(){
    this.maxStability = this.profileData["best_stability"]
  }

  getDataForProfilePlot(): any{
    this.loading = true;
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
        title: "Max stability",
        ticktext: [0, this.maxAvailableStability]
      }
    }
    x.push(biggestX+1); y.push(0); w.push(1);  t.push(""); marker.color.push(0)
    return {
      'x': x, 'y': y, 'with': w, type: 'bar', name: '', marker: marker, text: t,
      hovertemplate: '<b>Pos</b>: %{text}' +
                        '<br><b>TFO Count</b>: %{y}<br>',
                        textposition: "none"
    }
  }

}

//Alt 2:
/*

@Component({
  selector: 'app-data-visualization-alternative-two',
  templateUrl: './data-visualization-alternative-two.component.html',
  styleUrls: ['./data-visualization-alternative-two.component.css']
})
export class DataVisualizationAlternativeTwoComponent {
  token: string | null = null
  profileData: any | undefined = undefined
  minStability: number = 0
  maxAvailableStability: number = 100
  plot: any | undefined = undefined
  loading: boolean = false
  maxStability: any = {}

  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute){}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token'); 
    if (this.token != null) {
      this.initializeProfilePlot(this.token)
    }
  }

  async initializeProfilePlot(token: string){
    const l1: any = new Date()
    this.triplexService.get_mspack_data(token).then((data:any) => {
      this.profileData = data
      const l2: any = new Date()
      console.log("Retrieving and unpacking data: " + (l2 - l1)/1000)
      this.getMaxStabilityShapes()
      this.drawProfilePlot()
    })
  }

  async drawProfilePlot(){
    const l1: any = new Date()
    const data: any[] = this.getDataForProfilePlot()
    await new Promise((r) => setTimeout(r, 1))
    const layout = {
      yaxis: {title: 'TFO Count', range: [-data[1]/3, data[1]]},
      yaxis2: {
        title: 'max stability',
        overlaying: 'y',
        side: 'right',
        range: [this.maxAvailableStability, -this.maxAvailableStability*3]
      }
    }
    if (this.plot==undefined){
      this.plot = Plotly.newPlot('plotDiv', [this.maxStability, data[0]], layout, {responsive: true}).then((x:any) => {
        this.loading = false;
      })
    } else {
      Plotly.react('plotDiv', [this.maxStability, data[0]], layout).then((x:any) => {
        this.loading = false;
      });
    }
    //this.loading = false;
    const l2: any = new Date()
    console.log("Plotly drawing: " + (l2 - l1)/1000)
  }

  getMaxStabilityShapes(){
    const maxStability = this.profileData["best_stability"]
    let x: number[] = []; let y: number[] = []; let w: number[] = [];
    maxStability.forEach((element: number[]) => {
      x.push(element[1])
      y.push(element[0])
      if (element.length==2){
        w.push(1)
      } else {
        w.push(element[2])
      }
    });
    this.maxStability = {
      'x': x, 'y': y, 'with': w, name: 'Max stability', yaxis: 'y2',
      fill: 'tozeroy',
      type: 'scatter',
      line: {
        color: "gray",
        width: 0
      }
    }
  }

  getDataForProfilePlot(): any{
    this.loading = true;
    const l1: any = new Date()
    let x: number[] = []; let y: number[] = []; let w: number[] = [];
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
      return [{
        'x': x, 'y': y, 'with': w
      }, 0]
    }
    let maxValue = 0;
    profiles[String(stabilityValues[position])].forEach((element: number[]) => {
      x.push(element[1])
      y.push(element[0])
      if (element[0]>maxValue){
        maxValue = element[0]
      }
      if (element.length==2){
        w.push(1)
      } else {
        w.push(element[2])
      }
    });
    const l2: any = new Date()
    console.log("Data processing: " + (l2 - l1)/1000)
    return [{
      'x': x, 'y': y, 'with': w, type: 'bar', name: 'TFO count', marker: {color: "black"}
    }, maxValue]
  }

}
*/