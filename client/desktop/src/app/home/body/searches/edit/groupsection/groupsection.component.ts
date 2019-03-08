import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Group } from '../../../../../client/datamodel/group';
import { MatTableDataSource, MatSort, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionDialog } from '../../../../../dialogs/question/question.component';
import { CustomValidators } from '../../../../../utils/customvalidators';
import { EditSearchData } from '../editsearch.component';
import { SearchesService } from '../../../../../client/searches.service';
import { GroupsService } from '../../../../../client/groups.service';
import { LinkSectionComponent } from '../linksection/linksection.component';

@Component({
    selector: 'groupsection',
    templateUrl: './groupsection.component.html',
    styleUrls: ['./groupsection.component.css'],
    providers: [SearchesService, GroupsService]
})
export class GroupSectionComponent implements OnInit {
    @Input() defaultContactPhone: string = "";
    @Input("linksection") linkSection: LinkSectionComponent;

    @ViewChild(MatSort) groupSort: MatSort;
    public data: Group[] = [];
    dataSource = new MatTableDataSource([]);
    displayColumns: string[] = ['name', 'description', 'contactPhone', 'active'];
    rows: FormArray = this.fb.array([], CustomValidators.uniqueBy('name', false));
    form: FormGroup = this.fb.group({ 'groups': this.rows });

    constructor(@Inject(MAT_DIALOG_DATA) public dialogdata: EditSearchData,
        private groupService: GroupsService,
        private searchService: SearchesService,
        public dialog: MatDialog, private fb: FormBuilder) {
        if (dialogdata && dialogdata != null && dialogdata.search != null) {
            let searchsid = dialogdata.search.sid;
            this.searchService.getGroups(searchsid).subscribe((data) => {
                this.data = <Group[]>data;
                this.ngOnInit();
            });
        }
    }

    ngOnInit() {
        //important to go reverse
        for (let i = this.data.length - 1; i >= 0; i--) {
            this.addRow(this.data[i], false);
        }
        this.updateView();
    }

    emptyTable() {
        while (this.rows.length !== 0) {
            this.rows.removeAt(0);
        }
    }

    addRow(d?: Group, noUpdate?: boolean) {
        const row = this.fb.group({
            'name': [d.name, Validators.required],
            'description': [d.description, []],
            'contactPhone': [d.contactPhone, Validators.required],
            'active': [d.active]
        });
        this.rows.insert(0, row);
        if (!noUpdate) { this.updateView(); }
    }

    updateView() {
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.groupSort;
    }

    /**
     * @name onEditGroup
     * @description edit group event
     * @param {number} sid  the sid to modify
     * @param {Group} element the group element to modify
     */
    onEditGroup(sid: number, element: any) {
        element.flagEditing = true;
    }

    /**
     * @name onCreateGroup
     * @description create a new group event
     */
    onCreateGroup() {
        let g = new Group(this.findLastCreatedSid() - 1, "", "", "", this.defaultContactPhone, "", false, -1);
        (<any>g).flagEditing = true;
        this.data.splice(0, 0, g);
        this.addRow(g);
        this.updateView();
    }

    /**
     * @name findLastCreatedSid
     * @description Groups recent created (not at database) have a negative sid. this Util method find the last recent created group (not in database yet)
     * @return {number} the last (negative)
     */
    findLastCreatedSid(): number {
        let last = 0;
        this.data.forEach((group) => {
            if (group.sid < 0) {
                if (group.sid < last) {
                    last = group.sid;
                }
            }
        });
        return last;
    }

    /**
     * @name onDeleteGroup
     * @description delete group event
     * @param {number} sid the sid of the element to delete
     * @param {number} index the index row of the element to delete
     */
    onDeleteGroup(sid, index) {
        if (sid >= 0) {
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
                    this.groupService.delete(sid).subscribe((data) => {
                        for (let i = 0; i < this.data.length; i++) {
                            if (this.data[i].sid == sid) {
                                this.data.splice(i, 1);
                                this.rows.removeAt(index);
                                this.updateView();
                                this.linkSection.removeGroup(sid);
                                return;
                            }
                        }
                    });
                }
            });
        } else {
            //recent created (not at database yet, we just must remove it from the table)
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].sid == sid) {
                    this.data.splice(i, 1);
                    this.rows.removeAt(index);
                    this.updateView();
                    this.linkSection.removeGroup(sid);
                    return;
                }
            }
        }
    }

    presave() {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i].name = (<any>this.form.controls.groups).controls[i].controls.name.value;
            this.data[i].contactPhone = (<any>this.form.controls.groups).controls[i].controls.contactPhone.value;
            this.data[i].description = (<any>this.form.controls.groups).controls[i].controls.description.value;
            this.data[i].active = (<any>this.form.controls.groups).controls[i].controls.active.value;
        }
    }

    /**
     * @name getDataToSave
     * @description return the data to be saved at the database
     * @returns {Group[]} the list of groups to be saved
     */
    public getDataToSave(): Group[] {
        let result: Group[] = [];
        this.data.forEach((group) => {
            //removing flagEditing field if exist
            const newg = Object.assign({}, group, { flagEditing: undefined });
            result.push(newg);
        });
        return result;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}

