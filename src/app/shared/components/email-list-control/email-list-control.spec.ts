import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { EmailListControl } from './email-list-control';

describe('EmailListControl', () => {
  let component: EmailListControl;
  let fixture: ComponentFixture<EmailListControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailListControl],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailListControl);
    component = fixture.componentInstance;
  });

  // -------------------------------------------------------------------------
  // Creation & initial state
  // -------------------------------------------------------------------------
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should start with exactly one empty email row', () => {
    fixture.detectChanges();
    expect(component.emails.length).toBe(1);
    expect(component.emails.at(0).value).toBe('');
  });

  // -------------------------------------------------------------------------
  // addEmail
  // -------------------------------------------------------------------------
  it('addEmail should append a new empty control', () => {
    fixture.detectChanges();
    component.addEmail();
    expect(component.emails.length).toBe(2);
    expect(component.emails.at(1).value).toBe('');
  });

  it('addEmail should append with a given value', () => {
    fixture.detectChanges();
    component.addEmail('a@example.com');
    expect(component.emails.at(1).value).toBe('a@example.com');
  });

  // -------------------------------------------------------------------------
  // removeEmail
  // -------------------------------------------------------------------------
  it('removeEmail should drop the row at the given index', () => {
    fixture.detectChanges();
    component.addEmail('a@example.com');
    component.addEmail('b@example.com');
    expect(component.emails.length).toBe(3);

    component.removeEmail(1);
    expect(component.emails.length).toBe(2);
    expect(component.emails.at(0).value).toBe('');
    expect(component.emails.at(1).value).toBe('b@example.com');
  });

  it('removeEmail should keep at least one row when removing the last remaining', () => {
    fixture.detectChanges();
    expect(component.emails.length).toBe(1);

    component.removeEmail(0);
    // 刪到 0 後自動補一列
    expect(component.emails.length).toBe(1);
    expect(component.emails.at(0).value).toBe('');
  });

  it('removeEmail should mark the array as touched', () => {
    fixture.detectChanges();
    component.addEmail('a@example.com');
    component.removeEmail(1);
    expect(component.emails.touched).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Per-control email format validation
  // -------------------------------------------------------------------------
  it('should flag an invalid email format on the individual control', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('not-an-email');
    expect(component.emails.at(0).invalid).toBe(true);
  });

  it('should accept a valid email format', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('valid@example.com');
    expect(component.emails.at(0).valid).toBe(true);
  });

  it('empty value should not raise a format error (left to required)', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('');
    // 空值不算格式錯
    expect(component.emails.at(0).hasError('email')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Array-level: required (at least one)
  // -------------------------------------------------------------------------
  it('should be required-invalid when all rows are empty', () => {
    fixture.detectChanges();
    expect(component.emails.hasError('required')).toBe(true);
  });

  it('should clear required error once one valid email is entered', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    expect(component.emails.hasError('required')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Array-level: duplicates
  // -------------------------------------------------------------------------
  it('should flag duplicate emails at the array level', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('dup@example.com');
    component.addEmail('dup@example.com');
    expect(component.emails.hasError('duplicate')).toBe(true);
  });

  it('should treat duplicates case-insensitively', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('Dup@Example.com');
    component.addEmail('dup@example.com');
    expect(component.emails.hasError('duplicate')).toBe(true);
  });

  it('should not flag duplicates for distinct emails', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    component.addEmail('b@example.com');
    expect(component.emails.hasError('duplicate')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Validator interface (what the parent form sees)
  // -------------------------------------------------------------------------
  it('validate() should return emailInvalid when a row has a bad format', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('nope');
    expect(component.validate(component.emails)?.['emailInvalid']).toBeTruthy();
  });

  it('validate() should return required when all rows empty', () => {
    fixture.detectChanges();
    expect(component.validate(component.emails)?.['required']).toBeTruthy();
  });

  it('validate() should return duplicate when emails repeat', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    component.addEmail('a@example.com');
    expect(component.validate(component.emails)?.['duplicate']).toBeTruthy();
  });

  it('validate() should return null when one valid unique email exists', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    expect(component.validate(component.emails)).toBeNull();
  });

  // -------------------------------------------------------------------------
  // ControlValueAccessor: onChange propagation
  // -------------------------------------------------------------------------
  it('should emit the array value through onChange when a row changes', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.emails.at(0).setValue('a@example.com');
    expect(spy).toHaveBeenLastCalledWith(['a@example.com']);
  });

  it('should emit updated value after add and remove', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);

    component.emails.at(0).setValue('a@example.com');
    component.addEmail('b@example.com');
    expect(spy).toHaveBeenLastCalledWith(['a@example.com', 'b@example.com']);

    component.removeEmail(1);
    expect(spy).toHaveBeenLastCalledWith(['a@example.com']);
  });

  // -------------------------------------------------------------------------
  // ControlValueAccessor: writeValue
  // -------------------------------------------------------------------------
  it('writeValue should populate rows from an array', () => {
    fixture.detectChanges();
    component.writeValue(['a@example.com', 'b@example.com']);
    expect(component.emails.length).toBe(2);
    expect(component.emails.at(0).value).toBe('a@example.com');
    expect(component.emails.at(1).value).toBe('b@example.com');
  });

  it('writeValue with null should reset to a single empty row', () => {
    fixture.detectChanges();
    component.writeValue(['a@example.com', 'b@example.com']);
    component.writeValue(null);
    expect(component.emails.length).toBe(1);
    expect(component.emails.at(0).value).toBe('');
  });

  it('writeValue should reset touched/pristine state (reset alignment)', () => {
    fixture.detectChanges();
    // 製造 touched + dirty
    component.emails.at(0).setValue('a@example.com');
    component.emails.markAsTouched();
    expect(component.emails.touched).toBe(true);

    // 模擬外層 resetForm() → writeValue(null)
    component.writeValue(null);
    expect(component.emails.touched).toBe(false);
    expect(component.emails.pristine).toBe(true);
  });

  it('writeValue with empty array should still leave one empty row', () => {
    fixture.detectChanges();
    component.writeValue([]);
    expect(component.emails.length).toBe(1);
    expect(component.emails.at(0).value).toBe('');
  });

  // -------------------------------------------------------------------------
  // setDisabledState
  // -------------------------------------------------------------------------
  it('setDisabledState(true) should disable the array', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.emails.disabled).toBe(true);
  });

  it('setDisabledState(false) should re-enable the array', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    component.setDisabledState(false);
    expect(component.emails.disabled).toBe(false);
  });

  // -------------------------------------------------------------------------
  // firstRowErrorStateMatcher
  // -------------------------------------------------------------------------
  it('firstRowErrorStateMatcher should report error when array required & touched', () => {
    fixture.detectChanges();
    component.emails.markAsTouched(); // required 成立 + touched
    const isError = component.firstRowErrorStateMatcher.isErrorState(component.emails.at(0), null);
    expect(isError).toBe(true);
  });

  it('firstRowErrorStateMatcher should not report error when a valid email exists', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    component.emails.markAsTouched();
    const isError = component.firstRowErrorStateMatcher.isErrorState(component.emails.at(0), null);
    expect(isError).toBe(false);
  });

  // -------------------------------------------------------------------------
  // onTouched
  // -------------------------------------------------------------------------
  it('registerOnTouched callback should be wired', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnTouched(spy);
    component.onTouched();
    expect(spy).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // DOM rendering
  // -------------------------------------------------------------------------
  it('should render one mat-form-field per email row', () => {
    fixture.detectChanges();
    component.addEmail('a@example.com');
    fixture.detectChanges();
    const fields = fixture.debugElement.queryAll(By.css('mat-form-field'));
    expect(fields.length).toBe(2);
  });

  it('should show the duplicate error message in the DOM', () => {
    fixture.detectChanges();
    component.emails.at(0).setValue('a@example.com');
    component.addEmail('a@example.com');
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('.email-list__error') as HTMLElement;
    expect(err?.textContent).toContain('Duplicate');
  });
});
