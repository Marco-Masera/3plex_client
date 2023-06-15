
export interface Repeat{
    repClass: string
    repName: string 
    repFamily: string
    start: number
    end: number
}

export class PlottableRepeat{
    repClass: string = ""
    xAxis: number[] = []
    yAzis: (null | string)[] = []
    text: string[] = []

  //Format repeats retrieved by get_repeat in a plotly-ready format
  static format_repeats_for_plotlt(repeats: Repeat[], max_: number): PlottableRepeat[]{
    //Group repeats by repClass
    let bucket: { [repClass: string] : Repeat[]; } = {}
    repeats.forEach(repeat => {
      if (bucket.hasOwnProperty(repeat.repClass)){
        bucket[repeat.repClass].push(repeat)
      } else {
        bucket[repeat.repClass] = [repeat]
      }
    })

    //Sort each bucket by starting coordinate
    for (let k in bucket) {
      bucket[k].sort( (a:Repeat, b:Repeat) => { return a.start - b.start });
    }

    //Build plotly readable data structure for each repClass
    let plottables: PlottableRepeat[] = []
    //If no repeats returns empty track
    if (repeats.length == 0){
      let plottable = new PlottableRepeat("", [0, max_], [null, null], ["",""])
      return [plottable]
    }

    for (let k in bucket) {
      let current_repeats = bucket[k];
      if (current_repeats.length == 0){
        continue;
      }
      let xAxis: number[] = []; let yAxis: (null | string)[] = [];
      let texts: string[] = [];
      if (current_repeats[0].start > 0){
        xAxis.push(0); yAxis.push(null); texts.push("");
      }

      current_repeats.forEach( (value:Repeat, index: number) => {
        xAxis.push(value.start)
        xAxis.push(value.end)
        yAxis.push(value.repClass); yAxis.push(value.repClass);
        let label = `${value.repClass} - ${value.repFamily} - ${value.repName}`
        texts.push(label); texts.push(label);
        if (index < current_repeats.length - 1){
          if (value.end < current_repeats[index+1].start){
            yAxis.push(null); 
            xAxis.push(value.end); 
            texts.push("");
          }
        }
      });

      if (xAxis[xAxis.length - 1] < max_){
        xAxis.push(max_); yAxis.push(null); texts.push("");
      }

      let plottable = new PlottableRepeat(k, xAxis, yAxis, texts)
      plottables.push(plottable)
    }
    return plottables;
  }

  constructor(repClass: string, xAxis: number[], yAzis: (null | string)[], text: string[]){
    this.repClass = repClass;
    this.xAxis = xAxis;
    this.yAzis = yAzis;
    this.text = text;
  }
}