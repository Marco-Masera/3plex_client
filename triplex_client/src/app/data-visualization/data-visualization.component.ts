
import { Component } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlottableRepeat, Repeat } from '../model/repeats';
import {MatIconModule} from '@angular/material/icon';

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
  dsDNAID: string | null = null;
  dataForVisuals: DataForVisuals | undefined = undefined
  profileData: any | undefined = undefined
  profileMaxX: number = 0
  statisticData: any | undefined = undefined;
  minStability: number = 0
  maxAvailableStability: number = 100
  loading: boolean = true
  updating: boolean = false
  maxStability: any = {}
  fullSequence: string[] = [];
  maxXaxisRange: number[] = []
  plotTraces: any[] = [];
  oldPlots: any[] = [];
  plotTracesIndexForStatistics: number[] = []
  oldPlotTracesIndexForStatistics: number[] = []
  randomizationAverage: number[] = [];
  randomizationVariance: number[] = [];
  profileLinearY: number[] = [];
  filteredTPX: any[] | null = null;
  plotsLayout: any = {
    grid: {rows: 1, columns: 1},
    xaxis: {},
    legend: {"orientation": "h", x:0, y:1.15, bgcolor: '#E2E2E2',bordercolor: '#FFFFFF',borderwidth: 2},
    margin: {
      autoexpand: true
    },
    selectdirection: 'h',
    shapes: []
  };
  oldPlotsLayout: any = {}
  height = 100;

  constructor(private triplexService: TriplexServiceService, private route: ActivatedRoute,
    private _router: Router){}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.dsDNAID = this.route.snapshot.paramMap.get('dsDNAID');
    const self = this;
    if (this.token != null) {
      this.triplexService.get_data_for_visualizations(this.token, this.dsDNAID).then( (response:any) => {
        if (!response.success){
          this._router.navigate(['checkjob/token/', this.token]);
        } else {
          this.dataForVisuals = response.payload;
          this.filteredTPX = this.dataForVisuals?.available?.tpx;
          this.fullSequence = response.payload.available.sequence.split("")//.map((value:string, i:number) => i+"\n"+value)
          this.initializePlots().then(() => {
            this.triplexService.getDBD(self.token || "").then(response => {
              if (response.success){
                const dbds = response.payload;
                this.selectedDBDs = dbds;
                self.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]); Plotly.react('uniquePlotDiv', self.plotTraces, self.plotsLayout);
              }
            });
          })
        }
      });
    }
  }

  isAddingDBD: boolean = false;
  selectedDBDs: number[][] = []
  isViewingDBD: boolean = false;
  dbdForViewing: number = -1;

  viewDBDDetails(){
    this.isViewingDBD = true;
    //Hide all plots except for profile and randomization
    this.oldPlots = this.plotTraces;
    this.oldPlotTracesIndexForStatistics = this.plotTracesIndexForStatistics;
    this.plotTraces = this.plotTraces.filter( (value:any, index:number) => 
      index==0 || this.plotTracesIndexForStatistics.indexOf(index)>-1
    );
    this.plotTracesIndexForStatistics = this.plotTraces.map(
      (plot:any, index:number)=>index
      ).slice(1);
    this.oldPlotsLayout = this.plotsLayout;
    const layout = JSON.parse(JSON.stringify(this.plotsLayout));
    layout.annotations = [layout.annotations[0]];
    layout.grid.rows = 1;
    layout.height = 260;
    this.plotsLayout = layout;
    Plotly.react('uniquePlotDiv', this.plotTraces, layout);
  }

  async selectDBDForDetails(index: number){
    this.dbdForViewing = index;
    this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1], index);
    //Zoom to dbd
    const xAxis = this.plotsLayout.xaxis.range
    if (xAxis[0] <= 0) {xAxis[0] = 1;}
    const start = this.selectedDBDs[index][0];
    const end = this.selectedDBDs[index][1]+0.4;
    this.zoomPlotToDBD(start, end, xAxis);
  }

  stopViewDBDDetails(){
    this.plotsLayout = this.oldPlotsLayout;
    this.isViewingDBD = false;
    //Restore all plots
    this.plotTraces = this.oldPlots;
    this.plotTracesIndexForStatistics = this.oldPlotTracesIndexForStatistics;
    this.dbdForViewing = -1;
    this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1], -1)
    Plotly.react('uniquePlotDiv', this.plotTraces, this.plotsLayout);
  }

  updateRemoteDBDs(){
    this.triplexService.setDBD(this.token || "", this.selectedDBDs)
  }

  addDbdMode(){
    if (!this.isAddingDBD){
      this.isAddingDBD = true
      Plotly.relayout('uniquePlotDiv', 'dragmode', 'select');
      this.plotsLayout.showlegend = false
      this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
      const myDiv: any = document.getElementById("uniquePlotDiv");
      const targets = (myDiv.firstChild.firstChild.firstChild.querySelector('.cartesianlayer').childNodes);
      targets.forEach((target:any, index:number) => {
        if (index > 0){target.style.opacity = "0.4";}
      });
      //Change cursor
      const dragLayer: any = document.getElementsByClassName('nsewdrag')[0];
      dragLayer.style.cursor = 'col-resize';
    } else {
      this.updateRemoteDBDs();
      this.isAddingDBD = false;
      let myDiv: any = document.getElementById("uniquePlotDiv");
      const targets = (myDiv.firstChild.firstChild.firstChild.querySelector('.cartesianlayer').childNodes);
      this.removeSelection(targets)
      Plotly.relayout('uniquePlotDiv', 'dragmode', 'zoom');
      this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
      this.plotsLayout.showlegend = true
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
      targets.forEach((target:any, index:number) => {
        if (index > 0){target.style.opacity = "1";}
      });
      //Change cursor
      const dragLayer: any = document.getElementsByClassName('nsewdrag')[0];
      dragLayer.style.cursor = '';
    }
  }

  selectedRegion: number[] | null = null;
  buildDBDsHightlight(barHeight:number, hoverOn=-1){
    //Add highlight to plot
    this.plotsLayout.shapes = this.selectedDBDs.map( (dbd, index) => {
      return {
        type: 'rect',
        xref: 'x',
        x0: dbd[0]-0.5,
        x1: dbd[1]+0.5,
        y0: 0, 
        y1: barHeight,
        fillcolor: '#baffec',
        opacity: (index==hoverOn || index==this.dbdForViewing) ? 0.9
         : this.isAddingDBD ? 0.5 : 0.3,
        line: {width: (index==hoverOn) ? 0.2 : 0},
        layer:'below'}
    });
    if (this.selectedRegion){
      this.plotsLayout.shapes.push(
         {
            type: 'rect',
            xref: 'x',
            x0: this.selectedRegion[0]-0.5,
            x1: this.selectedRegion[1]+0.5,
            y0: 0, 
            y1: barHeight + 20,
            fillcolor: '#C9FF24',
            opacity: 0.5,
            line: {width: 0.2},
            layer:'below'}
      );
    }
  }

  highlightRegion(event:any){
    //Add highlight to plot
    this.selectedRegion = event;
    this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
    Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
    const xAxis = this.plotsLayout.xaxis.range
    if (xAxis[0] <= 0) {xAxis[0] = 1;}
    this.zoomPlotToDBD(event[0], event[1], xAxis);
    document.getElementById('uniquePlotDiv')?.scrollIntoView({behavior: 'smooth'});
  }

  removeDBD(index: number){
    this.selectedDBDs.splice(index, 1);
    this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
    Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
    this.updateRemoteDBDs();
  }

  mouseHoverDBD(index: number, entering: boolean){
    if (entering){
      this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1], index);
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
    } else {
      this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
    }
  }

  addDBD(eventData: any){
    if (eventData && eventData.range){
      var start: number = Math.round( eventData.range.x[0] );
      var end: number = Math.round( eventData.range.x[1] );
      if (start < 0) {start = 0;}
      var newDBDs: number[][] = []
      //Look for DBDs that overlaps with new one
      this.selectedDBDs.forEach( (dbd:number[]) => {
        if( (dbd[0] <= start && dbd[1] >= start) || (dbd[0] > start && dbd[0] <= end)){
          //Do not add
        } else {
          newDBDs.push(dbd);
        }
      });
      newDBDs.push([start, end]);
      newDBDs.sort((a, b) => {
        return a[0] - b[0];
      });
      this.selectedDBDs = newDBDs;
      this.buildDBDsHightlight(this.plotsLayout.yaxis.range[1]);
      Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
    }
  }

  removeSelection(targets: any | undefined){
    if (!targets){
      const myDiv: any = document.getElementById("uniquePlotDiv");
      targets = (myDiv.firstChild.firstChild.firstChild.querySelector('.cartesianlayer').childNodes);
    }
    const range = this.plotsLayout.xaxis.range;
    targets.forEach((target:any, index: number) => {
      if (index < 3){
        const rect = target.getBoundingClientRect();
        const offset = range[0] * (rect.width / this.fullSequence.length);
        this.doubleClick(rect.left+200+offset, rect.bottom - 100);
        this.doubleClick(rect.left+200+offset, rect.bottom - 100);
      }
    });
  }

  async zoomPlotToDBD(start:number, end:number, xAxis: number[]){
    //If position out of current xaxis, move current xaxis
    if (start < xAxis[0] || end > xAxis[1]){
      if (start < xAxis[0]){
        xAxis[0] = Math.max(start - 40, 0);
      }
      if (end > xAxis[1]){
        xAxis[1] = end + 30;
      }
    }
    if (xAxis[1]-xAxis[0] > (end-start)*8){
      xAxis[0] = start - ((end-start)*4)
      xAxis[1] = end + ((end-start)*4)
    }
    this.plotsLayout.xaxis.range = xAxis;
    this.plotsLayout.xaxis.autorange = false
    await Plotly.react('uniquePlotDiv',this.plotTraces, this.plotsLayout);
  }

  async changeDBD(index: number){
    if (!this.isAddingDBD){
      this.addDbdMode()
    }

    const xAxis = this.plotsLayout.xaxis.range
    if (xAxis[0] <= 0) {xAxis[0] = 1;}
    const start = this.selectedDBDs[index][0];
    const end = this.selectedDBDs[index][1]+0.4;
    let myDiv: any = document.getElementById("uniquePlotDiv");
    const targets = (myDiv.firstChild.firstChild.firstChild.querySelector('.cartesianlayer').childNodes);
    this.removeSelection(targets)
    await new Promise((r) => setTimeout(r, 100));
    await this.zoomPlotToDBD(start,end,xAxis);

    const plot = targets[0].querySelector('.plot')
    const rect = plot.getBoundingClientRect();
    const s = rect.left + (rect.width * ((start) / this.profileMaxX));
    const e = rect.left + (rect.width * ((end) / this.profileMaxX));
    this.mouseDrag(s, e, rect.bottom-20);
  }

onDBDSelected(index:number){
  if (this.isViewingDBD){
    this.selectDBDForDetails(index)
  } else {
    this.changeDBD(index);
  }
}

  mouseDrag(x1:number, x2: number, y:number){
    const mouseEvent = function(type:any, x:any, y:any, opts:any) {
      var fullOpts = {
          bubbles: true,
          clientX: x,
          clientY: y
      };
      var el = (opts && opts.element) || document.elementFromPoint(x, y),ev;
      ev = new window.MouseEvent(type, fullOpts);
      el.dispatchEvent(ev);
      return el;
    };

    const click = function(x1:number, x2: number, y:number, opts:any) {
        mouseEvent('mousemove', x1, y, opts);
        mouseEvent('mousedown', x1, y, opts);
        mouseEvent('mousemove', x2, y, opts);
        mouseEvent('mouseup', x2, y, opts);
    };
    return new Promise(function(resolve) {
        click(x1, x2, y, {});
    });
  }

  doubleClick(x:any, y:any) {
    const mouseEvent = function(type:any, x:any, y:any, opts:any) {
      var fullOpts = {
          bubbles: true,
          clientX: x,
          clientY: y
      };
      var el = (opts && opts.element) || document.elementFromPoint(x, y),ev;
      ev = new window.MouseEvent(type, fullOpts);
      el.dispatchEvent(ev);
      return el;
    };

    const click = function(x:any, y:any, opts:any) {
        mouseEvent('mousemove', x, y, opts);
        mouseEvent('mousedown', x, y, opts);
        mouseEvent('mouseup', x, y, opts);
        mouseEvent('click', x, y, opts);
    };
    return new Promise(function(resolve) {
        click(x, y, {});
        setTimeout(function() {
            click(x, y, {});
        }, 10 / 2);
    });
};

  //This function is called once dataForVisuals has been retrieved
  async initializePlots(){
    var profileURLPrefix = this.dataForVisuals?.available?.profile_dynamic ? 
      this.triplexService.getBaseUrl() + this.triplexService.getAPIUrl() : this.triplexService.getBaseUrl().slice(0,-1)
    const profile = this.initializeProfilePlot(profileURLPrefix + this.dataForVisuals?.available?.tfo_profile);
    const secondaryStruct = this.initializeSecondaryStructurePlot(this.dataForVisuals?.available?.secondary_structure);
    const conservation = this.initializeConservationPlot();
    const repeats = this.initializeRepeatsPlot();
    const randomizationStatistics = this.initializeRandomPlot(this.dataForVisuals?.available?.statistics)
    const annotations: {
      text: string; font: { size: number; color: string; }; showarrow: boolean; align: string; x: number; //position in x domain
      y: number; //position in y domain
      xref: string; yref: string;
    }[] = []
    await Promise.all([profile, secondaryStruct, conservation, randomizationStatistics, repeats]).then(async (data) => {
      const repeats = data.pop();
      const statistics = data.pop()
      const plots = data.filter(x => x!=null);
      this.loading = false;
      plots.forEach((plot, index) => {
        const y = "y"+(index+1)
        plot.yaxis = y;
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
      let lastYValue = (1+plots.length);
      if (repeats && repeats.length>0){
        lastYValue+=1;
      }
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
      this.plotsLayout.height = this.height;
      await new Promise((r) => setTimeout(r, 100));
      this.plotsLayout.annotations = annotations;

      if (statistics.length > 0){
        statistics[statistics.length-1].yaxis = "y"+lastYValue
        statistics.forEach((st:any) => {
          this.plotTracesIndexForStatistics.push(this.plotTraces.length)
          this.plotTraces.push(st);
        });
        const lastYValueString = "yaxis"+lastYValue
        this.plotsLayout[lastYValueString] = {
            title: '-log p-Value',
            overlaying: 'y',
            side: 'right'
        }
      }

      const config = {
        modeBarButtonsToRemove: ['lasso2d', 'zoomOut2d', 'zoomIn2d', 'select2d'] 
      }
      const self = this;
      var last_s:number[] = []
      await Plotly.newPlot('uniquePlotDiv', this.plotTraces, this.plotsLayout, config).then( (x:any) =>{
        self.maxXaxisRange = self.plotsLayout.xaxis.range;
        let myDiv: any = document.getElementById("uniquePlotDiv");
        if (myDiv != null){
          myDiv.on('plotly_selected', function(eventData:any) {
            if (!eventData || !eventData.range){return;}
            if (eventData.range.x[0] == last_s[0] && eventData.range.x[1] == last_s[1]){return;}
            last_s = eventData.range.x;
            self.addDBD(eventData);
          });
        }
      });
    });
  }
  
  async updateProfilePlot(){
    this.updating = true;
    const new_plot: any[] = this.getDataForProfilePlot();
    this.plotTraces[0] = new_plot;
    if (this.filteredTPX){
      console.log(this.filteredTPX.length)
      this.filteredTPX = this.dataForVisuals?.available?.tpx.filter(
        (tpx:any) => tpx.Stability >= this.minStability
      );
      console.log(this.filteredTPX?.length)
    }
    if (this.statisticData){
      const new_random_plot: any[] = this.getDataForRandomPlot();
      this.plotTracesIndexForStatistics.forEach(index => {
        this.plotTraces[index] = new_random_plot.pop();
      });
      this.buildDBDsHightlight(this.plotTraces[0].maxY);
    }
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

  async initializeRandomPlot(urlToStatistics: string){
    if (!urlToStatistics){this.statisticData = null; return []}
    return this.triplexService.get_mspack_data(urlToStatistics).then((data:any) => {
      this.statisticData = data
      return this.getDataForRandomPlot();
    });
  }

  async initializeProfilePlot(urlToProfiles: string){
    return this.triplexService.get_mspack_data_no_url(urlToProfiles).then((data:any) => {
      this.profileData = data
      this.maxStability = this.profileData["best_stability"]
      return this.getDataForProfilePlot()
    })
  }

  processArray(data: any){
    const final: number[] = [];
    data.forEach((elem: number[]) => {
      if (elem[0] == null){elem[0] = 0;}
      if (elem.length==1){
        final.push(elem[0])
      } else {
        for (let i=0; i<elem[1]; i++){
          final.push(elem[0]);
        }
      }
    })
    return final;
  }

  getProfileDataByStability(profiles: any){
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
      return []
    }
    return profiles[String(stabilityValues[position])]
  }

  loadingUCSC = false

  openUCSC(){
    this.loadingUCSC = true;
    this.triplexService.getUCSCLink(this.token || "", this.dsDNAID || "", String(this.minStability)).then(
      (result:any) => {
        this.loadingUCSC = false;
        if (result.success){
          console.log(result);
          window.open(result.payload, '_blank');
        }
      }
    ).catch( (e:any) => {this.loadingUCSC=false;})
  }

  computePValue(ttsCount: number[], ttsAverage:number[], ttsVariance:number[]){
    function standardNormalCDF(x:number) {
      function erf(x:number) {
        const t = 1 / (1 + 0.5 * Math.abs(x));
        const erf = 1 - t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
        return x >= 0 ? erf : -erf;
      }
      const sqrt2 = Math.sqrt(2);
      return 0.5 * (1 + erf(x / (sqrt2)));
    }
    const pValues: number[] = [];
    const definedValues: number[] = [];
    const labels: string[] = [];
    for (let i=0; i<ttsCount.length; i++){
      const stdDev = Math.sqrt( ttsVariance[i]);
      const maxP = 15;
      if (stdDev>0){
        var pValue = - Math.log10(1 - standardNormalCDF(Math.abs(ttsCount[i]-ttsAverage[i])/stdDev));
        if (pValue>maxP) {pValue = maxP; labels.push(">"+maxP)} else {labels.push(""+pValue);}
        definedValues.push(i);
        pValues.push(pValue);
      } else {
        definedValues.push(i);
        pValues.push(0);
        labels.push("Not defined")
      }
    }
    return [definedValues, pValues, labels];
  }

  getDataForRandomPlot():any{
    //Find position in the statistics object
    const statistics = this.statisticData["data"];
    const dataToProcess = this.getProfileDataByStability(statistics);
    if (dataToProcess.length==0){return []}

    //Data in form: [ [value, (len)] for each statistics ]
    //  statistics are ["median","lower_quartile","upper_quartile","percentile_95", "max"]
    //statistics must be processed into simple array from 0 to len
    const data = dataToProcess.map((value:any) => this.processArray(value));
    //Data might contain empty arrays, meaning they are equal to the preceding one
    for (let i=1; i<data.length; i++){
      if (data[i].length==0){
        data[i] = data[i-1];
      }
      if (data[i].length != data[i-1].length){
        return [];
      }
    }
    const len = data[0].length;
    const medianData = [...data[0]];
    const xValues = Array.from({length: len}, (_, index) => index);
    const xValuesReversed = [...xValues].reverse();
    const upperQuartileData = [...data[2]].reverse();
    const upperQuartileDataNotreversed = data[2];
    const lowerQuartileData = [...data[1]].reverse();
    const ninetyFivePercentData = [...data[3]].reverse();
    //Save average and variance
    this.randomizationAverage = data[5];
    this.randomizationVariance = data[6];

    //BASE CONSTANT TO SET
    const LEGEND_FOR_ALL = false;
    const TRANSPARENCY = 0.12;

    const medianTrace = {
      x: xValues, 
      y: medianData, 
      line: {color: `rgb(43, 66, 46)`, width: 1}, 
      mode: "lines", 
      name: "Randomization", 
      type: "scatter",
      legendgroup:"randomization",
      hoverinfo:"text+y", text:"Randomization - Median"
    };
    const maxTrace = {
      x: xValues, 
      y: data[4], 
      line: {color: "rgb(43, 66, 46)", width: 0.7, dash: 'dot'}, 
      mode: "line", 
      name: "Max", 
      type: "scatter",
      legendgroup:"randomization", showlegend: LEGEND_FOR_ALL, 
      hoverinfo:"skip"
    };
    const upperQuartile = {
      x: xValues.concat(xValuesReversed),  //0 to len to 0 again
      y: medianData.concat(upperQuartileData), 
      fill: "tozerox", 
      fillcolor: `rgba(80, 80, 80,${TRANSPARENCY})`, 
      line: {color: "transparent"}, 
      name: "Upper quartile", 
      legendgroup:"randomization",
      type: "scatter", showlegend: LEGEND_FOR_ALL,
      hoverinfo:"skip"
    };
    const lowerQuartile = {
      x: xValues.concat(xValuesReversed),  //0 to len to 0 again
      y: medianData.concat(lowerQuartileData), 
      fill: "tozerox", 
      fillcolor: `rgba(80, 80, 80,${TRANSPARENCY})`, 
      line: {color: "transparent"}, 
      name: "Lower quartile", 
      type: "scatter",
      legendgroup:"randomization", showlegend: LEGEND_FOR_ALL,
      hoverinfo:"skip"
    };
    const ninetyFivePercent = {
      x: xValues.concat(xValuesReversed),  //0 to len to 0 again
      y: upperQuartileDataNotreversed.concat(ninetyFivePercentData), 
      fill: "tozerox", 
      fillcolor: `rgba(140, 140, 140,${TRANSPARENCY})`, 
      line: {color: "transparent"}, 
      name: "95p", 
      legendgroup:"randomization",
      type: "scatter", showlegend: LEGEND_FOR_ALL,
      hoverinfo:"skip"
    };
    const pValueTraces = this.computePValue(this.profileLinearY, this.randomizationAverage, this.randomizationVariance);
    const pValueTrace = {
      x: pValueTraces[0],
      y: pValueTraces[1], 
      text: pValueTraces[2],
      hovertemplate: '<b>-log</b>: %{text}',
      name: "p-value", 
      type: "lines", showlegend: true,
      line: {
        color: 'rgb(128, 0, 128, 0.5)',
        width: 0.3
      }
    }
    return [medianTrace, upperQuartile, lowerQuartile, ninetyFivePercent, maxTrace, pValueTrace]
  }

  getDataForProfilePlot(): any{
    let x: number[] = []; let y: number[] = []; let w: number[] = []; let t: string[] = []
    const profilesByStability = this.getProfileDataByStability(this.profileData["profiles"]);
    if (profilesByStability.length == 0){
      return {
        'x': x, 'y': y, 'with': w
      }
    }

    x.push(0); y.push(0); w.push(1); t.push("")
    let biggestX = 0;
    let biggestY = 0;
    var linearYValues: number[] = [];
    var lastX = 0;
    profilesByStability.forEach((element: any[]) => {
      x.push(element[1])
      if (element[1]> biggestX){
        biggestX = element[1]
      }
      y.push(element[0]);
      if (element[0] > biggestY){biggestY = element[0]}
      if (element.length==2){
        w.push(1)
        t.push(element[1])
      } else {
        w.push(element[2]);
        t.push(String(element[1]-(element[2]-1)/2) + "-" + String(element[1]+(element[2]-1)/2));
      }
      //Fill linearYValues;
      const width = (element.length==2) ? 1 : element[2];
      const startX = element[1] - ((width-1)/2);
      if (startX > lastX+1){
        linearYValues = linearYValues.concat(Array(startX - lastX - 1).fill(0));
      }
      if (element.length==2){
        linearYValues.push(element[0]);
        lastX = element[1];
      } else {
        linearYValues = linearYValues.concat(Array(element[2]).fill(element[0]));
        lastX = startX + width - 1;
      }
    });

    this.profileLinearY = linearYValues;

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
    this.profileMaxX = biggestX + 1;
    x.push(biggestX+1); y.push(0); w.push(1);  t.push(""); marker.color.push(0);
    return {
      'x': x, 'y': y, 'width': w, type: 'bar',name: "TTS count", marker: marker, text: t, maxY: biggestY,
      hovertemplate: '<b>Pos</b>: %{text}' +
                        '<br><b>TTS Count</b>: %{y}<br>',
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
