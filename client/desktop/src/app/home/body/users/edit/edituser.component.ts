import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../../../client/users.service';
import { User } from '../../../../client/datamodel/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from './ErrorStateMatcher';

@Component({
    selector: 'edituser',
    templateUrl: './edituser.component.html',
    styleUrls: ['./edituser.component.css'],
    providers: [UserService]
})
export class EditUserComponent implements OnInit {
    userForm: FormGroup;
    matcher = new MyErrorStateMatcher();

    editUser: User = null;
    flagEdit: boolean = false;
    originalUser: User = null;
    currentUser: any;

    constructor(private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<EditUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EditUserData, private service: UserService) {

        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;

        if (data && data != null && data.user != null) {
            this.originalUser = data.user;
            //cloning
            this.editUser = JSON.parse(JSON.stringify(data.user));
            this.editUser.hpassword = this.reducePassword(this.editUser.hpassword);
            this.flagEdit = true;
        } else {
            this.editUser = new User(-1, "", "", "", "", "USER");
        }

    }

    /**
     * @name reducePassword
     * @description reduce the hashed password length
     * @param {string} password  the password to reduce
     * @return {string} the password reduced
     */
    reducePassword(password: string) {
        if (password.length > 10) {
            return password.substr(0, 10);
        } else {
            return password;
        }
    }

    ngOnInit() {
        this.userForm = this.formBuilder.group({
            username: [this.editUser.username, Validators.required],
            password: [this.editUser.hpassword, Validators.required],
            confirmpass: [this.editUser.hpassword, Validators.required],
            email: [this.editUser.email, [Validators.required, Validators.email]],
            description: [this.editUser.description, []],
            role: [this.editUser.role, Validators.required]
        }, { validator: this.checkPasswords });
    }

    /**
     * Check if both passwords are identical
     * @param group FormGroup
     */
    checkPasswords(group: FormGroup) { // here we have the 'passwords' group
        let pass = group.controls.password.value;
        let confirmpass = group.controls.confirmpass.value;

        return pass === confirmpass ? null : { notSame: true }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    save(): void {
        var keys = Object.keys(this.userForm.controls);
        for (var i = 0; i < keys.length; i++) {
            var ctrl = this.userForm.controls[keys[i]];
            if (ctrl.errors && ctrl.errors != null) {
                return;
            }
        }
        if (this.userForm.hasError('notSame')) {
            return;
        }

        this.editUser.username = this.userForm.controls.username.value;
        this.editUser.email = this.userForm.controls.email.value;
        this.editUser.description = this.userForm.controls.description.value;
        this.editUser.role = this.userForm.controls.role.value;

        if (this.flagEdit) {
            //checking if the password was modified
            let passreduced = this.reducePassword(this.originalUser.hpassword);
            if (passreduced !== this.userForm.controls.password.value) {
                this.editUser.hpassword = this.userForm.controls.password.value;
            } else {
                this.editUser.hpassword = this.originalUser.hpassword;
            }

            this.service.update(this.editUser).subscribe();
            this.dialogRef.close();
        } else {
            this.editUser.hpassword = this.userForm.controls.password.value;
            this.service.create(this.editUser).subscribe();
            this.dialogRef.close();
        }
    }

}

export interface EditUserData {
    user: User;
}