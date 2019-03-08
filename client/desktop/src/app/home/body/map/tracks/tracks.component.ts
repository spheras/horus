import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatTableDataSource, MatSort, MatDialog, MAT_DIALOG_DATA, MatSelectChange, MatDialogRef } from '@angular/material';
import { QuestionDialog } from '../../../../dialogs/question/question.component';
import { CustomValidators } from '../../../../utils/customvalidators';
import { SearchesService } from '../../../../client/searches.service';
import { Track } from 'src/app/client/datamodel/track';
import { Search } from 'src/app/client/datamodel/search';
import { Group } from 'src/app/client/datamodel/group';
import { TracksService } from 'src/app/client/tracks.service';
import { Profile } from 'src/app/client/datamodel/profile';
import { Technique } from 'src/app/client/datamodel/technique';
import { Operation } from 'src/app/client/datamodel/operation';
import { ProfilesService } from 'src/app/client/profiles.service';
import { TechniquesService } from 'src/app/client/techniques.service';
import { OperationsService } from 'src/app/client/operations.service';

@Component({
    selector: 'tracks',
    templateUrl: './tracks.component.html',
    styleUrls: ['./tracks.component.css'],
    providers: [SearchesService, TracksService, ProfilesService, OperationsService, TechniquesService]
})
export class TracksComponent implements OnInit {
    @ViewChild(MatSort) trackSort: MatSort;
    public data: Track[] = [];
    public groups: Group[] = [];
    public search: Search;
    public profiles: Profile[];
    public techniques: Technique[];
    public operations: Operation[];
    dataSource = new MatTableDataSource([]);
    displayColumns: string[] = ['name', 'description', 'main', 'profile_name', 'operation_name', 'technique_name'];
    rows: FormArray = this.fb.array([], CustomValidators.uniqueBy('name', false));
    form: FormGroup = this.fb.group({ 'tracks': this.rows });

    constructor(@Inject(MAT_DIALOG_DATA) public dialogdata: EditTracksData,
        private searchService: SearchesService,
        private profilesService: ProfilesService,
        private operationsService: OperationsService,
        private techniquesService: TechniquesService,
        private tracksService: TracksService,
        public dialogRef: MatDialogRef<TracksComponent>,
        public dialog: MatDialog, private fb: FormBuilder) {

        this.profilesService.getAll().subscribe((data) => {
            this.profiles = data;
        });
        this.techniquesService.getAll().subscribe(data => {
            this.techniques = data;
        });
        this.operationsService.getAll().subscribe(data => {
            this.operations = data;
        });

        if (dialogdata && dialogdata != null && dialogdata.search != null) {
            this.search = dialogdata.search;
            this.groups = dialogdata.groups;
            this.data = (this.groups.length > 0 ? (<any>this.groups[0]).tracks : []);
        }
    }

    ngOnInit() {
        //important to go reverse
        for (let i = this.data.length - 1; i >= 0; i--) {
            this.addRow(this.data[i], false);
        }
        this.updateView();
    }

    onGroupChange(event: MatSelectChange) {
        let group: Group = this.groups.find((value, index, obj) => {
            return value.sid == event.value;
        });
        if (group != null) {
            this.data = (<any>group).tracks;
            this.ngOnInit();
        }
    }

    emptyTable() {
        while (this.rows.length !== 0) {
            this.rows.removeAt(0);
        }
    }

    addRow(d?: Track, noUpdate?: boolean) {
        const row = this.fb.group({
            'name': [d.name, Validators.required],
            'description': [d.description, []],
            'main': [d.main],
            'profile_name': [d.profile_name],
            'operation_name': [d.operation_name],
            'technique_name': [d.technique_name]
        });
        this.rows.insert(0, row);
        if (!noUpdate) { this.updateView(); }
    }

    updateView() {
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.trackSort;
    }

    /**
     * @name onEditTrack
     * @description edit track event
     * @param {number} sid  the sid to modify
     * @param {Track} element the track element to modify
     */
    onEditTrack(sid: number, element: any) {
        element.flagEditing = true;
    }

    /**
     * @name onDeleteTrack
     * @description delete track event
     * @param {number} sid the sid of the element to delete
     * @param {number} index the index row of the element to delete
     */
    onDeleteTrack(sid, index) {
        //database existing group
        let dialogRef = this.dialog.open(QuestionDialog, {
            data: {
                title: 'DIALOG.DELETE.TITLE',
                question: 'DIALOG.DELETE.QUESTION',
                icon: 'delete'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.tracksService.delete(sid).subscribe((data) => {
                    for (let i = 0; i < this.data.length; i++) {
                        if (this.data[i].sid == sid) {
                            this.data.splice(i, 1);
                            this.rows.removeAt(index);
                            this.updateView();
                            return;
                        }
                    }
                });
            }
        });
    }

    save() {
        var keys = Object.keys(this.form.controls);
        for (var i = 0; i < keys.length; i++) {
            var ctrl = this.form.controls[keys[i]];
            if (ctrl.errors && ctrl.errors != null) {
                return;
            }
        }

        for (let i = 0; i < this.data.length; i++) {
            let tracki = this.data[i];
            if ((<any>tracki).flagEditing) {
                tracki.name = (<any>this.form.controls.tracks).controls[i].controls.name.value;
                tracki.description = (<any>this.form.controls.tracks).controls[i].controls.description.value;
                tracki.main = (<any>this.form.controls.tracks).controls[i].controls.main.value;
                tracki.profile_name = (<any>this.form.controls.tracks).controls[i].controls.profile_name.value;
                tracki.operation_name = (<any>this.form.controls.tracks).controls[i].controls.operation_name.value;
                tracki.technique_name = (<any>this.form.controls.tracks).controls[i].controls.technique_name.value;
                let updatedTrack = new Track(tracki.sid,
                    tracki.name,
                    tracki.description,
                    tracki.uid,
                    tracki.main,
                    tracki.fk_group,
                    tracki.fk_profile,
                    tracki.fk_operation,
                    tracki.fk_technique,
                    tracki.profile_name,
                    tracki.operation_name,
                    tracki.technique_name)
                this.tracksService.update(updatedTrack).subscribe();
            }
        }

        this.dialogRef.close();
    }

    /**
     * @name getDataToSave
     * @description return the data to be saved at the database
     * @returns {Track[]} the list of tracks to be saved
     */
    public getDataToSave(): Track[] {
        let result: Track[] = [];
        this.data.forEach((track) => {
            //removing flagEditing field if exist
            const newt = Object.assign({}, track, { flagEditing: undefined });
            result.push(newt);
        });
        return result;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }



}

export interface EditTracksData {
    search: Search;
    groups: Group[];
}