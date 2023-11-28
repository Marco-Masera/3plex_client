import { Component, ViewChild, AfterViewInit, Input } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TriplexServiceService } from '../services/triplex-service.service';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-summary-web-table',
  templateUrl: './summary-web-table.component.html',
  styleUrls: ['./summary-web-table.component.css']
})
export class SummaryWebTableComponent {
  @Input() token: string | null = "";
  tableColumns: string[] = ['ssRNA_id', 'dsDNA_id_short', 'dsDNA_chr', 'dsDNA_b', 'dsDNA_e', 'stability_best', 'stability_norm', 'score_best']
  tableColumnsNames: string[] = ['ssRNA Id', 'dsDNA Id', 'Chr', 'Begin', 'End', 'Best stability', 'Stability norm', 'Best score'];
  webSummaryDataSource = new MatTableDataSource<any>([]);
  tableData: any[] | null = [];
  dsDNAIdFilter: string = "";
  bestStabilityMinMax: number[]| null = null;
  stabilityNormMinMax: number[]| null = null;
  bestScoreMinMax: number[]| null = null;
  bestStabilitySelected: number[] = [0,0];
  stabilityNormSelected: number[] = [0,0];
  bestScoreSelected: number[] = [0,0];

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  constructor(private triplexService: TriplexServiceService, private router: Router){}
  ngAfterViewInit() {
    this.webSummaryDataSource.paginator = this.paginator;
    this.webSummaryDataSource.sort = this.sort;
  }

  ngOnInit(){
    this.triplexService.getWebSummary(this.token || "").then( results => {
      if (results.success){
        this.buildMinMaxValuesAnddsDNAID(results.payload);
        this.webSummaryDataSource.data = results.payload;
        this.tableData = results.payload;
      }
    })
  }

  clickedRow(row:any){
    window.open(this.router.url + "/" + row.dsDNA_id, "_blank");
  }

  isTimerActive = false;
  timerId: any | null = null;
  filtersUpdated() {
    if (this.isTimerActive) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.updateTableWithFilters();
      this.isTimerActive = false;
    }, 400);
    this.isTimerActive = true;
  }

  updateTableWithFilters(){
    this.webSummaryDataSource.data = this.tableData?.filter( (element:any) => {
      return element.dsDNA_id.includes(this.dsDNAIdFilter) && 
      element.stability_best >= this.bestStabilitySelected[0] && element.stability_best <= this.bestStabilitySelected[1] &&
      element.stability_norm >= this.stabilityNormSelected[0] && element.stability_norm <= this.stabilityNormSelected[1] &&
      element.score_best >= this.bestScoreSelected[0] && element.score_best <= this.bestScoreSelected[1]
    }) || [];
  }

  buildMinMaxValuesAnddsDNAID(results: any | null){
    if (results == null){return;}
    results.forEach((element:any) => {
      element.dsDNA_id_short = element.dsDNA_id.split(":")[0];
      if (this.bestScoreMinMax == null){
        this.bestScoreMinMax = [element.score_best, element.score_best]
      } else {
        if (element.score_best < this.bestScoreMinMax[0]){
          this.bestScoreMinMax[0] = element.score_best;
        }
        if (element.score_best > this.bestScoreMinMax[1]){
          this.bestScoreMinMax[1] = element.score_best;
        }
      }
      if (this.stabilityNormMinMax == null){
        this.stabilityNormMinMax = [element.stability_norm, element.stability_norm]
      } else {
        if (element.stability_norm < this.stabilityNormMinMax[0]){
          this.stabilityNormMinMax[0] = element.stability_norm;
        }
        if (element.stability_norm > this.stabilityNormMinMax[1]){
          this.stabilityNormMinMax[1] = element.stability_norm;
        }
      }
      if (this.bestStabilityMinMax == null){
        this.bestStabilityMinMax = [element.stability_best, element.stability_best]
      } else {
        if (element.stability_best < this.bestStabilityMinMax[0]){
          this.bestStabilityMinMax[0] = element.stability_best;
        }
        if (element.stability_best > this.bestStabilityMinMax[1]){
          this.bestStabilityMinMax[1] = element.stability_best;
        }
      }
    });
    if (this.bestScoreMinMax)
      this.bestScoreSelected = [this.bestScoreMinMax[0], this.bestScoreMinMax[1]];
    if (this.stabilityNormMinMax)
      this.stabilityNormSelected = [this.stabilityNormMinMax[0], this.stabilityNormMinMax[1]];
    if (this.bestStabilityMinMax)
      this.bestStabilitySelected = [this.bestStabilityMinMax[0], this.bestStabilityMinMax[1]];
    
  }
}
