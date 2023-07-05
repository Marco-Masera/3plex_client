
import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlottableRepeat, Repeat } from '../model/repeats';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare let Plotly: any;


interface DataForVisuals{
  job: any; available: any
}

@Component({
  selector: 'app-data-visualization-alt',
  templateUrl: './data-visualization-alt.component.html',
  styleUrls: ['./data-visualization-alt.component.css']
})
export class DataVisualizationAltComponent {
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
  fullSequence: string[] = [];
  plotsWithXaxis = ["plotDiv"]
  isExporting = false;

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
          this.fullSequence = response.payload.available.sequence.split("")//.map((value:string, i:number) => i+"\n"+value)
          if (this.dataForVisuals?.available.repeats && this.dataForVisuals.available.repeats.length > 0){
            this.plotsWithXaxis.push("plotDivRepeats")
          } else if (this.dataForVisuals?.available.conservation) {
            this.plotsWithXaxis.push("plotDivConservation")
          } else {
            this.plotsWithXaxis.push("plotDivSecondaryStructure")
          }
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

  async exportPlots(){
    this.isExporting = true;
    await new Promise((r) => setTimeout(r, 20))
    let DATA: any = document.getElementById('toPrint');
    html2canvas(DATA, {scale: 4}).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 10;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('plots.pdf');
      this.isExporting = false;
    });
  }

  initializeSecondaryStructurePlot(path: string){
    if (!path){
      return null;
    }
    return this.triplexService.get_mspack_data(path).then((data:number[]) => {
      this.secondaryStructureData = data;
      const title =  {
        text:'Secondary structure',
        font: {
          size:16
        },
        x: 0.5
      }
      let bottom_m = 0;
      if (this.plotsWithXaxis.includes("plotDivSecondaryStructure")){bottom_m = 25;}
      const layout = {
        yaxis: {
          autorange: true, fixedrange: true,
          tickformat: '.3f'
        }, margin:{b: bottom_m, t: 30, l:50,r:0},height: 160, title: title
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

  getTicks(range: number[] | null, plotName: string){
    if (range == null || range==undefined || range[0]==undefined || range[1]==undefined){
      return {range: [0, this.fullSequence.length]}
    }
    if (range[1]-range[0] >= 40 || !this.plotsWithXaxis.includes(plotName)){ 
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

  graph_changed_zoom_callback(plot_div: string, eventdata: any){
    if (this.graphBusy[plot_div]){
      this.graphBusy[plot_div] = false;
      return;
    }
    this.graphBusy[plot_div] = true;
    const plots = ["plotDiv","plotDivConservation","plotDivRepeats", "plotDivSecondaryStructure"]
    plots.forEach( (plot: string)=> {
        const div:any = document.getElementById(plot);
        let oldLayout = div.layout
        if (oldLayout && eventdata){
          let l2 = Object.assign({}, oldLayout);
          l2.xaxis = this.getTicks([eventdata["xaxis.range[0]"], eventdata["xaxis.range[1]"] ], plot);
          this.graphBusy[plot] = true;
          Plotly.relayout(plot, l2);
        }
    })
  }

  async initializeRepeatsPlot(){
    if (!this.dataForVisuals?.available.repeats?.length){
      return;
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
              x: value.xAxis, y: value.yAzis, mode: "lines+markers", type: "scatter", 
              connectgaps: false, name: value.repClass, text: value.text,
              line:{
                width:6
              },
              marker:{
                size: 6
              },
              hovertemplate: "<b>%{text}</b><br>X: %{x}<br>"
            }
        });
    const title =  {
          text:'Repeats',
          font: {
            size:16
          },
          x: 0.5
        }
    const layout = {
          yaxis: {
            fixedrange: true,
            visible: false,
            showticklabels: false,
          },
          xaxis: {
            range: [0, max_size],
            showline: false,
            zeroline: false,
          },  margin:{b: 30, t: 30, l:50,r:0},height: 140, title: title
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
      const title =  {
        text:'Conservation',
        font: {
          size:16
        },
        
        x: 0.5
      }
      let bottom_m = 0;
      if (this.plotsWithXaxis.includes("plotDivConservation")){bottom_m = 25;}
      const layout = {
        yaxis: {autorange: true, fixedrange: true}, margin:{b: bottom_m, t: 30, l:50,r:0},height: 160, title:title
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
    const title =  {
      text:'TTF count',
      font: {
        size:16
      },
      x: 0.5
    }
    await new Promise((r) => setTimeout(r, 20))
    const layout = {
      margin:{b: 30, t: 30, l:50,r:0},height: 220, yaxis: {fixedrange: true}, title: title,
      xaxis: { range: null
      }
    }
    if (this.profileGraphDiv==undefined){
      Plotly.newPlot('plotDiv', [data], layout, {responsive: true}).then((x:any) => {
        this.loading = false;
        this.profileGraphDiv = document?.getElementById('plotDiv')
        this.profileGraphDiv.on("plotly_relayout", (eventdata:any) => {
            this.graph_changed_zoom_callback("plotDiv", eventdata);
        });
      })
    } else {
      let oldRange = this.profileGraphDiv.layout.xaxis.range;
      layout.xaxis.range = oldRange;
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
        x: 1.02,
        title: "Stability th.",
        ticktext: [0, this.maxAvailableStability]
      }
    }
    x.push(biggestX+1); y.push(0); w.push(1);  t.push(""); marker.color.push(0)
    return {
      'x': x, 'y': y, 'with': w, type: 'bar', name: '', marker: marker, text: t,
      hovertemplate: '<b>Pos</b>: %{text}' +
                        '<br><b>TTF Count</b>: %{y}<br>',
                        textposition: "none"
    }
  }

}