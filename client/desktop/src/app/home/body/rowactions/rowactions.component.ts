import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
    selector: 'rowactions',
    templateUrl: './rowactions.component.html',
    styleUrls: ['./rowactions.component.css'],
})
export class RowActionsComponent implements OnInit {

    @Output()
    onDelete: EventEmitter<string> = new EventEmitter<string>();
    @Output()
    onEdit: EventEmitter<string> = new EventEmitter<string>();
    @Output()
    onShowMap: EventEmitter<string> = new EventEmitter<string>();
    @Output()
    onShowQR: EventEmitter<string> = new EventEmitter<string>();

    @Input() showEdit: boolean = true;
    @Input("showMap") showMapFlag: boolean = false;

    constructor() { }

    ngOnInit() {
    }

    delete() {
        this.onDelete.emit("");
    }

    edit() {
        this.onEdit.emit("");
    }

    showMap() {
        this.onShowMap.emit("");
    }

    showQR() {
        this.onShowQR.emit("");
    }
}
