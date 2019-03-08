import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanQrPage } from './scanqr';

@NgModule({
    declarations: [
        ScanQrPage,
    ],
    imports: [
        IonicPageModule.forChild(ScanQrPage),
    ],
})
export class ScanQrPageModule { }