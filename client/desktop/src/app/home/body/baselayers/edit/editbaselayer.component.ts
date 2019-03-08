import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseLayerService } from 'src/app/client/baselayers.service';
import { BaseLayer } from 'src/app/client/datamodel/baselayer';

@Component({
    selector: 'editbaselayer',
    templateUrl: './editbaselayer.component.html',
    styleUrls: ['./editbaselayer.component.css'],
    providers: [BaseLayerService]
})
export class EditBaseLayerComponent implements OnInit {
    baseLayerForm: FormGroup;

    editBaseLayer: BaseLayer = null;
    flagEdit: boolean = false;
    originalBaseLayer: BaseLayer = null;
    currentUser: any;

    constructor(private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<EditBaseLayerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EditBaseLayerData, private service: BaseLayerService) {

        this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;

        if (data && data != null && data.baseLayer != null) {
            this.originalBaseLayer = data.baseLayer;
            //cloning
            this.editBaseLayer = JSON.parse(JSON.stringify(data.baseLayer));
            this.flagEdit = true;
        } else {
            this.editBaseLayer = new BaseLayer(-1, "", "", "", "", "", 0, 0, "", false, true);
        }

    }

    ngOnInit() {
        this.baseLayerForm = this.formBuilder.group({
            name: [this.editBaseLayer.name, Validators.required],
            description: [this.editBaseLayer.description],
            url: [this.editBaseLayer.url, Validators.required],
            layers: [this.editBaseLayer.layers],
            format: [this.editBaseLayer.format],
            minZoom: [this.editBaseLayer.minZoom, [Validators.required, Validators.min(0), Validators.max(10000)]],
            maxZoom: [this.editBaseLayer.maxZoom, [Validators.required, Validators.min(0), Validators.max(10000)]],
            attribution: [this.editBaseLayer.attribution],
            transparent: [this.editBaseLayer.transparent],
            continousWorld: [this.editBaseLayer.continousWorld]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    save(): void {
        var keys = Object.keys(this.baseLayerForm.controls);
        for (var i = 0; i < keys.length; i++) {
            var ctrl = this.baseLayerForm.controls[keys[i]];
            if (ctrl.errors && ctrl.errors != null) {
                return;
            }
        }

        this.editBaseLayer.name = this.baseLayerForm.controls.name.value;
        this.editBaseLayer.description = this.baseLayerForm.controls.description.value;
        this.editBaseLayer.url = this.baseLayerForm.controls.url.value;
        this.editBaseLayer.layers = this.baseLayerForm.controls.layers.value;
        this.editBaseLayer.format = this.baseLayerForm.controls.format.value;
        this.editBaseLayer.minZoom = this.baseLayerForm.controls.minZoom.value;
        this.editBaseLayer.maxZoom = this.baseLayerForm.controls.maxZoom.value;
        this.editBaseLayer.attribution = this.baseLayerForm.controls.attribution.value;
        this.editBaseLayer.transparent = this.baseLayerForm.controls.transparent.value;
        this.editBaseLayer.continousWorld = this.baseLayerForm.controls.continousWorld.value;

        if (this.flagEdit) {
            this.service.update(this.editBaseLayer).subscribe();
            this.dialogRef.close();
        } else {
            this.service.create(this.editBaseLayer).subscribe();
            this.dialogRef.close();
        }
    }

}

export interface EditBaseLayerData {
    baseLayer: BaseLayer;
}