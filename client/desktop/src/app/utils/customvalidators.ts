import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

import { isBlank, isPresent } from './utils';

export class CustomValidators {

    public static uniqueBy = (field: string, caseSensitive: boolean = true): ValidatorFn => {
        return (formArray: FormArray): { [key: string]: boolean } => {
            const controls: AbstractControl[] = formArray.controls.filter((formGroup: FormGroup) => {
                return isPresent(formGroup.get(field).value);
            });
            const uniqueObj: any = { uniqueBy: true };
            let find: boolean = false;

            if (controls.length > 1) {
                controls.map(formGroup => formGroup.get(field)).forEach(x => {
                    if (x.errors) {
                        delete x.errors.uniqueBy;
                        if (isBlank(x.errors)) {
                            x.setErrors(null);
                        }
                    }
                });
                for (let i: number = 0; i < controls.length; i++) {
                    const formGroup: FormGroup = controls[i] as FormGroup;
                    const mainControl: AbstractControl = formGroup.get(field);
                    const val: string = mainControl.value;

                    const mainValue: string = caseSensitive ? val.toLowerCase() : val;
                    controls.forEach((group: FormGroup, index: number) => {
                        if (i === index) {
                            return;
                        }

                        const currControl: any = group.get(field);
                        const tempValue: string = currControl.value;
                        const currValue: string = caseSensitive ? tempValue.toLowerCase() : tempValue;
                        let newErrors: any;

                        if (mainValue === currValue) {
                            if (isBlank(currControl.errors)) {
                                newErrors = uniqueObj;
                            } else {
                                newErrors = Object.assign(currControl.errors, uniqueObj);
                            }
                            currControl.setErrors(newErrors);
                            find = true;
                        }
                    });
                }

                if (find) {
                    return uniqueObj;
                }
            }

            return null;
        };
    }
}
