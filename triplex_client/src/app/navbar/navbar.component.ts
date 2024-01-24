import { Component, Inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { PopupComponent } from './popup/popup.component';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';
import { TriplexServiceService } from '../services/triplex-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public dialog: MatDialog, private _router: Router, private service: TriplexServiceService) {}

  openDialog(state: string): void {
    const dialogRef = this.dialog.open(PopupComponent, {
      data: {state: state},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state && result.response && result.response.length > 0) {
        if (result.state == 'getmail'){
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {state: "email"},
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result && result.state && result.state == "email") {
              this.service.checkJobsMyEmail(result.response);
              const dialogRef = this.dialog.open(PopupComponent, {
                data: {state: "ok"},
              });
            }
          });
        } else if (result.state == "token") {
          this._router.navigate(['checkjob/token/', result.response]);
        }
      }
    });
  }

  checkIsDevMode(){
    return isDevMode()
  }
}
