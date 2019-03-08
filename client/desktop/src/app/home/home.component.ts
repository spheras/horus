import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Search } from '../client/datamodel/search';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
    @ViewChild(MatSidenav) sideNav: MatSidenav;

    /** to know what section has been selected */
    selected: string = "searches";
    //the search selected
    selectedSearch: Search = null;

    currentUser: any;

    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.sideNav.open();
        }, (1000));
    }

    showMap(event) {
        this.selectedSearch = event;
        this.selected = 'map';
    }
}
