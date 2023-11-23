import { Component, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TriplexServiceService } from '../services/triplex-service.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-full-tpx-table',
  templateUrl: './full-tpx-table.component.html',
  styleUrls: ['./full-tpx-table.component.css']
})
export class FullTpxTableComponent {
  tableColumns: string[] = ['Duplex_ID', 'tfo_start', 'tfo_end', 'TTS_start', 'TTS_end', 'Error_rate', 'Errors','Guanine_rate','Motif','Orientation',
    'Score', 'Stability', 'Strand', 'Representation']
  tableColumnsNames: string[] = this.tableColumns.map( value => value.replaceAll("_", " "))
  tpxDataSource = new MatTableDataSource<any>([]);
  @Input() set tpx(tpx: any[]){
    tpx.forEach((tpx:any) =>{ 
      const v = tpx.Representation.replaceAll(" ", ".")
      tpx.Representation = v
      const id = tpx.Duplex_ID.split(":")
      tpx.Duplex_ID = id[0] + " - " + id[2];
    })
    this.tpxDataSource.data = tpx;
    console.log(tpx)
  }
  @Output() onRowClicked: EventEmitter<any> = new EventEmitter();


  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private triplexService: TriplexServiceService, private router: Router){}
  ngAfterViewInit() {
    this.tpxDataSource.paginator = this.paginator;
  }

  ngOnInit(){
  }

  clickedRow(row:any){
    console.log(row);
    this.onRowClicked.emit([row.tfo_start, row.tfo_end]);
  }
}
