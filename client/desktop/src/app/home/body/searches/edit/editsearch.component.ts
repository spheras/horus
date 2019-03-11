import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatChipInputEvent, MatTableDataSource, MatSort } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SearchesService } from '../../../../client/searches.service';
import { Search } from '../../../../client/datamodel/search';
import { SPACE, COMMA, ENTER } from '@angular/cdk/keycodes';
import { Group } from '../../../../client/datamodel/group';
import { GroupSectionComponent } from './groupsection/groupsection.component';
import { AreaSectionComponent } from './areasection/areasection.component';
import { LinkSectionComponent } from './linksection/linksection.component';

@Component({
    selector: 'editsearch',
    templateUrl: './editsearch.component.html',
    styleUrls: ['./editsearch.component.css'],
    providers: [SearchesService]
})
export class EditSearchComponent implements OnInit {
    searchForm: FormGroup;

    editSearch: Search = null;
    flagEdit: boolean = false;
    originalSearch: Search = null;
    currentUser: any;
    //wgs84 regex, i.e. 37.417625, -6.014928
    latlongRegex = new RegExp('^(?<lat>(-?(90|(\d|[1-8]\d)(\.\d{1,6}){0,1})))\,{1}\s?(?<long>(-?(180|(\d|\d\d|1[0-7]\d)(\.\d{1,6}){0,1})))$/');

    @ViewChild("groupsection") groupSection: GroupSectionComponent;
    @ViewChild("areasection") areaSection: AreaSectionComponent;
    @ViewChild("linksection") linkSection: LinkSectionComponent;

    //separator key codes for tags
    separatorKeysCodes: number[] = [SPACE, ENTER, COMMA];
    //list of tags in edition
    tags: string[] = []

    constructor(private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<EditSearchComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EditSearchData, private service: SearchesService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;

        if (data && data != null && data.search != null) {
            this.originalSearch = data.search;
            //cloning
            this.editSearch = JSON.parse(JSON.stringify(data.search));
            this.flagEdit = true;
        } else {
            this.editSearch = new Search(-1, "", "", "", "", "", new Date().toString(), "", new Date().toString(), "", "","","","");
        }
    }

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            name: [this.editSearch.name, Validators.required],
            description: [this.editSearch.description],
            creation: [{ value: new Date(this.editSearch.creation), disabled: false }, Validators.required],
            contactphone: [this.editSearch.contactPhone, [Validators.required]],
            tags: [''],
            report: [this.editSearch.report],
            lastPointSighting: [this.parseGEOJSON(this.editSearch.lastPointSighting), Validators.pattern(this.latlongRegex)],
            lastPointSightingDate: [{ value: new Date(this.editSearch.lastPointSightingDate), disabled: false }],
            forwardCommandPost: [this.parseGEOJSON(this.editSearch.forwardCommandPost), Validators.pattern(this.latlongRegex)],
            location: [this.editSearch.location],
            locationPointMissingPerson:[this.parseGEOJSON(this.editSearch.locationPointMissingPerson), Validators.pattern(this.latlongRegex)],
            lastKnownPosition:[this.parseGEOJSON(this.editSearch.lastKnownPosition), Validators.pattern(this.latlongRegex)],
            initialPlanningPoint:[this.parseGEOJSON(this.editSearch.initialPlanningPoint), Validators.pattern(this.latlongRegex)]
        });
        if (this.editSearch.tags.trim().length > 0) {
            this.tags = this.editSearch.tags.split(' ');
        }
    }

    /**
     * @name parseGEOJSON
     * @description parse a geojson point field to show only the lat, lon
     * @param {string} field the field to parse
     * @return the field parsed
     */
    parseGEOJSON(field: string): string {
        if (field && field != null) {
            try{
                let json = JSON.parse(field);
                return json.coordinates[0] + ", " + json.coordinates[1];
            }catch(error){
                return field;
            }
        } else {
            return '';
        }
    }

    /**
     * @name addTag
     * @description add a tag to the tag list
     * @param {MatchipInputEvent} event the event produced
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our tag
        if ((value || '').trim()) {
            //avoiding repetitions
            const index = this.tags.indexOf(value.trim());
            if (index < 0) {
                this.tags.push(value.trim());
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.searchForm.controls.tags.setValue(null);
    }

    /**
     * @name removeTag
     * @description remove a tag from the edition list
     * @param {string} tag the tag to be removed
     */
    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }


    onNoClick(): void {
        this.dialogRef.close();
    }

    /**
     * @name save
     * @description save the info at the server database
     */
    save(): void {
        this.editSearch.name = this.searchForm.controls.name.value;
        this.editSearch.description = this.searchForm.controls.description.value;
        this.editSearch.creation = this.searchForm.controls.creation.value;
        this.editSearch.contactPhone = this.searchForm.controls.contactphone.value;
        this.editSearch.report = this.searchForm.controls.report.value;
        this.editSearch.tags = "";
        this.tags.forEach((tag) => {
            this.editSearch.tags = this.editSearch.tags + (this.editSearch.tags.length > 0 ? ' ' : '') + tag;
        });
        this.editSearch.lastPointSighting = this.searchForm.controls.lastPointSighting.value;
        this.editSearch.lastPointSightingDate = this.searchForm.controls.lastPointSightingDate.value;
        this.editSearch.forwardCommandPost = this.searchForm.controls.forwardCommandPost.value;
        this.editSearch.location = this.searchForm.controls.location.value;
        this.editSearch.locationPointMissingPerson = this.searchForm.controls.locationPointMissingPerson.value;
        this.editSearch.lastKnownPosition = this.searchForm.controls.lastKnownPosition.value;
        this.editSearch.initialPlanningPoint = this.searchForm.controls.initialPlanningPoint.value;

        if (this.flagEdit) {
            this.service.update(this.editSearch, this.groupSection.getDataToSave(), this.areaSection.getDataToSave(), this.linkSection.links).subscribe(() => {
                this.dialogRef.close();
            });
            this.dialogRef.close();
        } else {
            this.service.create(this.editSearch, this.groupSection.getDataToSave(), this.areaSection.getDataToSave(), this.linkSection.links).subscribe(() => {
                this.dialogRef.close();
            });
        }
    }
}

export interface EditSearchData {
    search: Search;
}