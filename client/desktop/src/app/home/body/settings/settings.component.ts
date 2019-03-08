import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SettingsService } from '../../../client/settings.service';
import { Settings } from '../../../client/datamodel/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { QuestionDialog } from '../../../dialogs/question/question.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    providers: [SettingsService]
})
export class SettingsComponent implements OnInit {
    currentUser: any;
    settings: Settings = null;
    settingsForm: FormGroup;

    constructor(private snackBar: MatSnackBar,
        private translate: TranslateService,
        private formBuilder: FormBuilder,
        public dialog: MatDialog, private service: SettingsService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
        this.settings = new Settings("0", "", 0, true);
        this.registerForm();
    }

    ngOnInit() {
        this.service.get().subscribe((settings: Settings) => {
            this.settings = settings;
            this.registerForm();
        }, (error) => { });
    }

    registerForm() {
        this.settingsForm = this.formBuilder.group({
            publicHostName: [{ value: this.settings.publicHostName, disabled: this.currentUser.role !== 'ADMIN' }, Validators.required],
            publicPort: [{ value: this.settings.publicPort, disabled: this.currentUser.role !== 'ADMIN' }, [Validators.required, Validators.min(80), Validators.max(100000)]],
            ssl: [{ value: this.settings.ssl, disabled: this.currentUser.role !== 'ADMIN' }],
        });
    }

    save() {
        var keys = Object.keys(this.settingsForm.controls);
        for (var i = 0; i < keys.length; i++) {
            var ctrl = this.settingsForm.controls[keys[i]];
            if (ctrl.errors && ctrl.errors != null) {
                return;
            }
        }

        let dialogRef = this.dialog.open(QuestionDialog, {
            data: {
                title: 'SETTINGS.SAVE.TITLE',
                question: 'SETTINGS.SAVE.QUESTION',
                icon: 'save'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.settings.publicHostName = this.settingsForm.controls.publicHostName.value;
                this.settings.publicPort = this.settingsForm.controls.publicPort.value;
                this.settings.ssl = this.settingsForm.controls.ssl.value;

                this.service.update(this.settings).subscribe((data) => {
                    this.snackBar.open(this.translate.instant("SETTINGS.SAVE.CORRECT_SUBTITLE"),
                        this.translate.instant("SETTINGS.SAVE.CORRECT_TITLE"), {
                            duration: 5000,
                        });
                });
            }
        });

    }

}
