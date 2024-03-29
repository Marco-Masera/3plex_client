import { Component, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  userInput: string = "";
  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public state: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  validateInput(){
    if (this.state.state == "token"){
      return this.userInput.length > 0;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.userInput.length > 0 && emailRegex.test(this.userInput);
  }
}
