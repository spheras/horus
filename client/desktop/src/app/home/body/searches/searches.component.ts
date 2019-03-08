import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { SearchesService } from '../../../client/searches.service';
import { EditSearchComponent } from './edit/editsearch.component';
import { QuestionDialog } from '../../../dialogs/question/question.component';
import { Search } from '../../../client/datamodel/search';
import { environment } from '../../../../environments/environment';


export interface SearchElement {
    name: string;
    creation: string;
    description: string;
    tags: string;
    contactPhone: string;
    report: string;
}

@Component({
    selector: 'searches',
    templateUrl: './searches.component.html',
    styleUrls: ['./searches.component.css'],
    providers: [SearchesService]
})
export class SearchesComponent implements OnInit {
    displayedColumns: string[] = ['creation', 'name', 'description', 'location', 'tags', 'contactPhone', 'report'];
    dataSource = new MatTableDataSource([]);
    currentUser: any;
    public selectedSearch: Search = null;

    @ViewChild(MatSort) sort: MatSort;
    @Output()
    onShowMap: EventEmitter<Search> = new EventEmitter<Search>();

    constructor(public dialog: MatDialog, private service: SearchesService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    }

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.updateSearches();
    }


    /**
     * @name updateSearches
     * @description update the searches from the database
     */
    updateSearches() {
        this.service.getAll().subscribe((data) => {
            this.dataSource = new MatTableDataSource(data);
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }


    onEdit(sid, element) {
        let dialogRef = this.dialog.open(EditSearchComponent, {
            role: 'dialog',
            width: '600px',
            data: {
                search: element
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateSearches();
        });
    }

    onCreate() {
        let dialogRef = this.dialog.open(EditSearchComponent, {
            role: 'dialog',
            width: '600px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateSearches();
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
                    this.updateSearches();
                });
            }
        });
    }

    showMap(element: Search) {
        this.selectedSearch = element;
        this.onShowMap.emit(element);
    }

    showQR(element: Search) {
        window.open(`/qrcode/${element.sid}`, "_blank");
    }
}
