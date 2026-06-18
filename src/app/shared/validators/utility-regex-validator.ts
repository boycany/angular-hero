// Utility function to create a regex-based validator
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function utilityRegexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return null;
    }
    return regex.test(control.value) ? null : error;
  };
}
