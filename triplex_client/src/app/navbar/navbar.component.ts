import { Component, Inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { PopupComponent } from './popup/popup.component';
import { Router } from '@angular/router';
import { isDevMode } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public dialog: MatDialog, private _router: Router) {}

  openDialog(state: string): void {
    const dialogRef = this.dialog.open(PopupComponent, {
      data: {state: state},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state && result.response && result.response.length > 0) {
        if (state == "token") {
          this._router.navigate(['checkjob/token/', result.response]);
        } else if (state == "email") {
          this._router.navigate(['checkjobs/email/' + result.response]);
        }
      }
    });
  }

  checkIsDevMode(){
    return isDevMode()
  }
}
