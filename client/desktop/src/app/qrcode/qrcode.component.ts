import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../client/groups.service';
import { Group } from '../client/datamodel/group';
import { Search } from '../client/datamodel/search';
import { SearchesService } from '../client/searches.service';
import { SettingsService } from '../client/settings.service';

@Component({
    selector: 'qrcode',
    templateUrl: './qrcode.component.html',
    styleUrls: ['./qrcode.component.css'],
    providers: [SearchesService, SettingsService]
})
export class QRComponent implements AfterViewInit {

    groups: Group[] = null;
    searchname: string = ""

    constructor(private service: SearchesService, private settingsService: SettingsService, private activatedRoute: ActivatedRoute) {
        this.activatedRoute.params.subscribe(params => {
            let sid = params['sid'];
            this.service.get(sid).subscribe((search) => {
                this.searchname = search.name;
            });

            this.settingsService.get().subscribe((settings) => {
                let hostname = settings.publicHostName;
                let port = settings.publicPort;
                let protocol = (settings.ssl ? 'https' : 'http');
                this.service.getGroups(sid).subscribe((groups) => {
                    this.groups = groups;
                    this.groups.forEach((group) => {
                        (<any>group).apiurl = `${protocol}://${hostname}:${port}/track`;
                        (<any>group).json = JSON.stringify(group);
                    })
                });
            });
        });
    }
    ngAfterViewInit(): void {
    }

}
