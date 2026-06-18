import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { CustomErrorStateMatcher } from './custom-error-state-matcher';

describe('CustomErrorStateMatcher', () => {
  let matcher: CustomErrorStateMatcher;
  let control: FormControl;
  let form: FormGroupDirective | NgForm | null;

  beforeEach(() => {
    matcher = new CustomErrorStateMatcher();
    control = new FormControl('', Validators.required);
    form = null;
  });

  it('should return false if control is null', () => {
    expect(matcher.isErrorState(null, form)).toBe(false);
  });

  it('should return false if control is valid', () => {
    control.setValue('some value');
    expect(matcher.isErrorState(control, form)).toBe(false);
  });

  it('should return false if control is invalid but pristine and untouched, and form is not submitted', () => {
    expect(matcher.isErrorState(control, form)).toBe(false);
  });

  it('should return true if control is invalid and dirty', () => {
    control.markAsDirty();
    expect(matcher.isErrorState(control, form)).toBe(true);
  });

  it('should return true if control is invalid and touched', () => {
    control.markAsTouched();
    expect(matcher.isErrorState(control, form)).toBe(true);
  });

  it('should return true if control is invalid and form is submitted', () => {
    form = { submitted: true } as NgForm;
    expect(matcher.isErrorState(control, form)).toBe(true);
  });

  it('should handle both NgForm and FormGroupDirective', () => {
    const ngForm = { submitted: true } as NgForm;
    const formGroupDirective = { submitted: true } as FormGroupDirective;

    expect(matcher.isErrorState(control, ngForm)).toBe(true);
    expect(matcher.isErrorState(control, formGroupDirective)).toBe(true);
  });
});
