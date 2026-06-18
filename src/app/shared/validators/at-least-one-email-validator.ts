import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function atLeastOneEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[] | null;
    const hasOne = Array.isArray(value) && value.some((v) => (v ?? '').trim().length > 0);
    return hasOne ? null : { required: true };
  };
}
