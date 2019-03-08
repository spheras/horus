import { Component, OnInit, ViewChild, Input } from '@angular/core';


@Component({
    selector: 'bodyhead',
    templateUrl: './bodyhead.component.html',
    styleUrls: ['./bodyhead.component.css']
})
export class BodyHeadComponent {
    @Input() title: string;
    @Input() icon: string;
    @Input() subtitle: string;

    constructor() { }
}
