import { FormControl } from '@angular/forms';

export class RepeatedNameValidator {
    static noRepeatedName(fc: FormControl) {
        if (fc.value.toLowerCase() === "abc123" || fc.value.toLowerCase() === "123abc") {
            return ({ validUsername: true });
        } else {
            return (null);
        }
    }
}