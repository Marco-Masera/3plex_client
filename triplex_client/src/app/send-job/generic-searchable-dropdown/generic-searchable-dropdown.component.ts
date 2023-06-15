import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PrintableModelObject } from 'src/app/model/printable_modelobject';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
import { Observable, Subject, from } from 'rxjs';
import { InfoPopupComponent } from './info-popup/info-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-generic-searchable-dropdown',
  templateUrl: './generic-searchable-dropdown.component.html',
  styleUrls: ['./generic-searchable-dropdown.component.css']
})
export class GenericSearchableDropdownComponent<E extends PrintableModelObject> {
  @Input() get_options: ((query: string) => Promise<E[]>) | undefined = undefined
  @Input() show_help: boolean = false
  @Input() label: string = "put label here"
  @Input() set disabled (v: boolean){
    if (v){
      this.searchBarControl.disable()
    } else {
      this.searchBarControl.enable()
    }
 }
  @Output() itemSelectedEvent = new EventEmitter<E>();
  queryText: string = ""
  private searchTerms = new Subject<string>();

  constructor(public dialog: MatDialog) {}

  filteredOptions: Observable<E[]> = new Observable<E[]>();
  searchBarControl = new FormControl('');

  
  ngOnInit() {
    this.searchBarControl.valueChanges.subscribe((value:string | null) => {
      if (value != null && typeof(value)=="string"){
        this.searchTerms.next(value)
        this.queryText = value
      }
    })
    //this._filter(value)
    this.filteredOptions = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this._filter(term)),
    );
  }

  private _filter(value: string | null){
    if (this.get_options != undefined && value!=null && value.length>0){
      return from(this.get_options(value.toLowerCase()))
    } else {
      return from([])
    }
  }

  onValueSelected(event: MatAutocompleteSelectedEvent ){
    this.itemSelectedEvent.emit(event.option.value);
  }

  helpClicked(event:any, object: any){
    event.stopPropagation();
    const dialogRef = this.dialog.open(InfoPopupComponent, {
      data: {object: object},
    });
  }
}
