import { AbstractControl, ValidatorFn } from '@angular/forms';

export function positiveIntegerValidator(): ValidatorFn {
  const regex = new RegExp('^[0-9]*$');
  return (control: AbstractControl) => {
    if (!control.value) {
      return null;
    }
    return regex.test(control.value) ? null : { notPositiveInteger: true };
  };
}
