import { Component, OnInit, Inject, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Group } from '../../../../../client/datamodel/group';
import { MatTableDataSource, MatSort, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Area } from '../../../../../client/datamodel/area';
import { QuestionDialog } from '../../../../../dialogs/question/question.component';
import { CustomValidators } from '../../../../../utils/customvalidators';
import { EditSearchData } from '../editsearch.component';
import { GroupsService } from '../../../../../client/groups.service';
import { SearchesService } from '../../../../../client/searches.service';
import { AreasService } from '../../../../../client/areas.service';
import { LinkSectionComponent } from '../linksection/linksection.component';

@Component({
    selector: 'areasection',
    templateUrl: './areasection.component.html',
    styleUrls: ['./areasection.component.css'],
    providers: [SearchesService, AreasService]
})
export class AreaSectionComponent implements OnInit {
    @ViewChild(MatSort) areaSort: MatSort;
    @Input("linksection") linkSection: LinkSectionComponent;

    public data: Area[] = [];
    dataSource = new MatTableDataSource([]);
    displayColumns: string[] = ['name', 'description'];
    rows: FormArray = this.fb.array([], CustomValidators.uniqueBy('name', false));
    form: FormGroup = this.fb.group({ 'areas': this.rows });

    constructor(@Inject(MAT_DIALOG_DATA) public dialogdata: EditSearchData,
        private areaService: AreasService,
        private searchService: SearchesService,
        public dialog: MatDialog, private fb: FormBuilder) {
        if (dialogdata && dialogdata != null && dialogdata.search != null) {
            let searchsid = dialogdata.search.sid;
            this.searchService.getAreas(searchsid).subscribe((data) => {
                this.data = <Area[]>data;
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

    addRow(d?: Area, noUpdate?: boolean) {
        const row = this.fb.group({
            'name': [d.name, Validators.required],
            'description': [d.description, []]
        });
        this.rows.insert(0, row);
        if (!noUpdate) { this.updateView(); }
    }

    updateView() {
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.areaSort;
    }

    /**
     * @name onEditArea
     * @description edit group area
     * @param {number} sid  the sid to modify
     * @param {Group} element the group element to modify
     */
    onEditArea(sid: number, element: any) {
        element.flagEditing = true;
    }

    /**
     * @name onCreateArea
     * @description create a new area event
     */
    onCreateArea() {
        let g = new Area(this.findLastCreatedSid() - 1, "", "", -1, null);
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
     * @name onDeleteArea
     * @description delete area event
     * @param {number} sid the sid of the element to delete
     * @param {number} index the index row of the element to delete
     */
    onDeleteArea(sid, index) {
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
                    this.areaService.delete(sid).subscribe((data) => {
                        this.updateView();
                        this.linkSection.removeArea(sid);
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
                    this.linkSection.removeArea(sid);
                    return;
                }
            }
        }
    }

    presave() {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i].name = (<any>this.form.controls.areas).controls[i].controls.name.value;
        }
    }

    /**
     * @name getDataToSave
     * @description return the data to be saved at the database
     * @returns {Area[]} the list of areas to be saved
     */
    getDataToSave(): Area[] {
        let result: Area[] = [];
        this.data.forEach((area) => {
            //removing flagEditing field if exist
            const newg = Object.assign({}, area, { flagEditing: undefined });
            result.push(newg);
        });
        return result;
    }



    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}

