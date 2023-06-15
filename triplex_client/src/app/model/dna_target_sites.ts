import { PrintableModelObject } from "./printable_modelobject";

export class DnaTargetSites{
  constructor(obj:any) {
    obj && Object.assign(this, obj);
  }

  name: string = "";
  description: string = "";
  external_ref: string = "";
  n_sequences: number = 0;
  total_size_KB: number = 0;
  species: string = "";


  stored_formatted_str: string[] = [];
  last_query: string | undefined = undefined;

  get_help_tooltip(): string{
    return this.name + ".\n\n Click for details"
  }


  toString(): string{
    return this.name + "(len: " + this.n_sequences + ")";
  }
}