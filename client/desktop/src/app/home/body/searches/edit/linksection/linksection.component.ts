import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Group } from '../../../../../client/datamodel/group';
import { MatTableDataSource, MatSort, MatDialog, MatSelectChange, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionDialog } from '../../../../../dialogs/question/question.component';
import { CustomValidators } from '../../../../../utils/customvalidators';
import { Area } from '../../../../../client/datamodel/area';
import { GroupArea } from '../../../../../client/datamodel/group-area';
import { EditSearchData } from '../editsearch.component';
import { SearchesService } from '../../../../../client/searches.service';

@Component({
    selector: 'linksection',
    templateUrl: './linksection.component.html',
    styleUrls: ['./linksection.component.css']
})
export class LinkSectionComponent implements OnInit {
    @Input() groups: Group[];
    @Input() areas: Area[];

    links: GroupArea[] = [];
    selectedOptions: number[] = [];
    currentGroup: Group = null;

    constructor(@Inject(MAT_DIALOG_DATA) public dialogdata: EditSearchData,
        private searchService: SearchesService,
        public dialog: MatDialog, private fb: FormBuilder) {
        if (dialogdata && dialogdata != null && dialogdata.search != null) {
            let searchsid = dialogdata.search.sid;
            this.searchService.getLinks(searchsid).subscribe((data) => {
                this.links = <GroupArea[]>data;
                this.ngOnInit();
            });
        }
    }

    ngOnInit() {
    }

    /**
     * @name removeGroup
     * @description remove all the links for an existing group
     * @param {number} sid the sid to remove 
     */
    removeGroup(sid) {
        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].fk_group == sid) {
                this.links.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * @name removeArea
     * @description remove all the links for an existing area
     * @param {number} sid the sid to remove 
     */
    removeArea(sid) {
        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].fk_area == sid) {
                this.links.splice(i, 1);
                i--;
            }
        }
    }

    onGroupChange(event: MatSelectChange) {
        //before to change the group, lets update the links for the current group
        this.presave();
        //ok, now lets change the group
        let group: Group = event.value;
        this.currentGroup = group;
        this.selectedOptions = [];
        this.links.forEach((link) => {
            if (link.fk_group == group.sid) {
                this.selectedOptions.push(link.fk_area);
            }
        });
    }

    presave() {
        if (this.currentGroup != null) {
            //removing old references of currentgroup
            for (let i = 0; i < this.links.length; i++) {
                let link = this.links[i];
                if (link.fk_group == this.currentGroup.sid) {
                    this.links.splice(i, 1);
                    i--;
                }
            }

            //creating new references
            this.selectedOptions.forEach((selected) => {
                let newlink = new GroupArea(this.currentGroup.sid, selected);
                this.links.push(newlink);
            });
        }
    }
}

