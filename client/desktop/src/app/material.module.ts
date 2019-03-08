import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import {
    MatButtonModule, MatCardModule, MatDialogModule, MatInputModule, MatTableModule,
    MatToolbarModule, MatMenuModule, MatIconModule, MatProgressSpinnerModule, MatSnackBar,
    MatSnackBarModule, MatSortModule, MatTooltipModule, MatSidenavModule, MatCheckboxModule,
    MatDividerModule, MatListModule, MatOption, MatOptionModule, MatSelectModule, MatStepperModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS, MatSlideToggleModule, MatAutocompleteModule
} from '@angular/material';


@NgModule({
    imports: [
        CommonModule,
        MatToolbarModule,
        MatTooltipModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatMenuModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatDividerModule,
        MatListModule,
        MatSelectModule,
        MatOptionModule,
        MatStepperModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatAutocompleteModule
    ],
    exports: [
        CommonModule,
        MatToolbarModule,
        MatTooltipModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatMenuModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatDividerModule,
        MatListModule,
        MatSelectModule,
        MatOptionModule,
        MatStepperModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatAutocompleteModule
    ], providers: [
        MatSnackBar
    ]
})
export class CustomMaterialModule { }