import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { UserService } from '../../../client/users.service';
import { QuestionDialog } from '../../../dialogs/question/question.component';
import { EditUserComponent } from './edit/edituser.component';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    providers: [UserService]
})
export class UsersComponent implements OnInit {
    displayedColumns: string[] = ['username', 'email', 'role', 'description'];
    dataSource = new MatTableDataSource([]);
    currentUser: any;

    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private service: UserService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    }

    ngOnInit() {
        //we set the datasource of the table
        this.dataSource.sort = this.sort;
        this.updateUsers();
    }

    /**
     * @name updateUsers
     * @description update the users from the database
     */
    updateUsers() {
        this.service.getAll().subscribe((data) => {
            this.dataSource = new MatTableDataSource(data);
        });
    }

    /**
     * @name applyFilter
     * @description apply a filter to the table
     * @param {string} filterValue the value of the filter
     */
    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    /**
     * @name onDelete
     * @description The user want to delete the record
     */
    onDelete(sid) {
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
                    this.updateUsers();
                });
            }
        });
    }

    onEdit(sid, element) {
        let dialogRef = this.dialog.open(EditUserComponent, {
            role: 'dialog',
            width: '400px',
            data: {
                user: element
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateUsers();
        });
    }

    onCreate() {
        let dialogRef = this.dialog.open(EditUserComponent, {
            role: 'dialog',
            width: '400px',
        });
        dialogRef.afterClosed().subscribe(result => {
            this.updateUsers();
        });
    }
}
