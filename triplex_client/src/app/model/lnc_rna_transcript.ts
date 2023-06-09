import { PrintableModelObject } from "./printable_modelobject";

export class LncRnaTranscript implements PrintableModelObject {
  constructor(obj:any) {
    obj && Object.assign(this, obj);
  }
  chromosome: string = "";
  id: string = "";
  strand: string = "";
  transcript_type: string = "";
  gene_name: string = "";
  gene_id: string = "";
  longest: boolean = false;

  stored_formatted_str: string[] = [];
  last_query: string | undefined = undefined;

  get_help_tooltip(): string{
    return ""
  }

  toString(): string{
    return this.gene_name + " - " + this.gene_id + " - " + this.id + (
      this.longest ? " [longest]" : ""
    );
  }
  toStringWithBold(substring: string): string[]{
    //Check if the values are already stored
    if (this.last_query!=undefined && this.last_query == substring){
      return this.stored_formatted_str
    }

    let original = this.toString()
    this.last_query = substring
    if (substring.length==0){
      this.stored_formatted_str = [original, "", ""]
      return this.stored_formatted_str
    }
    let startingIndex = original.toLowerCase().indexOf(substring.toLowerCase())
    if (startingIndex==-1){
      this.stored_formatted_str = [original, "", ""]
      return this.stored_formatted_str
    }
    this.stored_formatted_str = [original.substring(0, startingIndex), original.substring(startingIndex,startingIndex+substring.length), original.substring(startingIndex+substring.length)]
    return this.stored_formatted_str
  }
}