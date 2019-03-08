import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { SearchesService } from '../../../client/searches.service';
import { QuestionDialog } from '../../../dialogs/question/question.component';
import { Search } from '../../../client/datamodel/search';
import { environment } from '../../../../environments/environment';
import { BaseLayer } from 'src/app/client/datamodel/baselayer';
import { BaseLayerService } from 'src/app/client/baselayers.service';
import { EditBaseLayerComponent } from './edit/editbaselayer.component';


export interface SearchElement {
    name: string;
    creation: string;
    description: string;
    tags: string;
    contactPhone: string;
    report: string;
}

@Component({
    selector: 'baselayers',
    templateUrl: './baselayers.component.html',
    styleUrls: ['./baselayers.component.css'],
    providers: [BaseLayerService]
})
export class BaseLayersComponent implements OnInit {
    displayedColumns: string[] = ['name', 'description', 'url', 'layers', 'format', 'minZoom', 'maxZoom', 'attribution', 'transparent', 'continousWorld'];
    dataSource = new MatTableDataSource([]);
    currentUser: any;
    public selectedLayer: BaseLayer = null;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private service: BaseLayerService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.updateLayers();
    }


    /**
     * @name updateLayers
     * @description update the baes layers from the database
     */
    updateLayers() {
        this.service.getAll().subscribe((data) => {
            this.dataSource = new MatTableDataSource(data);
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }


    onEdit(sid, element) {
        let dialogRef = this.dialog.open(EditBaseLayerComponent, {
            role: 'dialog',
            width: '600px',
            data: {
                baseLayer: element
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateLayers();
        });
    }

    onCreate() {
        let dialogRef = this.dialog.open(EditBaseLayerComponent, {
            role: 'dialog',
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateLayers();
        });
    }

    onDelete(sid: number) {
        let dialogRef = this.dialog.open(QuestionDialog, {
            data: {
                title: 'DIALOG.DELETE.TITLE',
                question: 'DIALOG.DELETE.QUESTION',
                icon: 'delete'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.delete(sid).subscribe((data) => {
                    this.updateLayers();
                });
            }
        });
    }

}
