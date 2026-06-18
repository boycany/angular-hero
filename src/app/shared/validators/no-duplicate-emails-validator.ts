import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noDuplicateEmailsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    const values = array.controls
      .map((c) => (c.value ?? '').trim().toLowerCase())
      .filter((v) => v.length > 0);

    const hasDuplicate = new Set(values).size !== values.length;
    return hasDuplicate ? { duplicate: true } : null;
  };
}
