import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'question',
    templateUrl: 'question.component.html',
    styleUrls: ['./question.component.css']
})
export class QuestionDialog {

    constructor(
        public dialogRef: MatDialogRef<QuestionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}


export interface QuestionDialogData {
    title: string;
    question: string;
    icon: string;
}