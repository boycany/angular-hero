import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Validators } from '@angular/forms';
import { vi } from 'vitest';

import { PhoneNumberControl } from './phone-number-control';

function query<T extends HTMLElement>(fixture: ComponentFixture<unknown>, css: string): T {
  return fixture.debugElement.query(By.css(css))?.nativeElement as T;
}

describe('PhoneNumberControl', () => {
  let component: PhoneNumberControl;
  let fixture: ComponentFixture<PhoneNumberControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneNumberControl],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneNumberControl);
    component = fixture.componentInstance;
    // 不在此呼叫 detectChanges，讓個別測試能先 setInput 再觸發
  });

  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Input: class bindings
  // -------------------------------------------------------------------------
  it('should apply the default countryFieldClass (field__country--default)', () => {
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('div.field__country--default').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('should apply custom countryFieldClass', () => {
    fixture.componentRef.setInput('countryFieldClass', ['field__country--custom']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div.field__country--custom')).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Initialisation & validators (effect 只管 validator，不動值)
  // -------------------------------------------------------------------------
  it('should start with a null country and empty placeholder when not required', () => {
    fixture.detectChanges();
    expect(component.countryControl.value).toBeNull();
    expect(component.phonePlaceholder()).toBe('');
    expect(component.countryControl.hasValidator(Validators.required)).toBe(false);
  });

  it('should not add required validator to country when not required', () => {
    fixture.detectChanges();
    expect(component.countryControl.hasValidator(Validators.required)).toBe(false);
    // phone 沒選國家、非 required → 無 validator
    expect(component.phoneControl.validator).toBeNull();
  });

  it('should add required validator to country when required is true', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(component.countryControl.hasValidator(Validators.required)).toBe(true);
  });

  it('should toggle country required validator when required input changes', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(component.countryControl.hasValidator(Validators.required)).toBe(true);

    fixture.componentRef.setInput('required', false);
    fixture.detectChanges();
    expect(component.countryControl.hasValidator(Validators.required)).toBe(false);
  });

  it('applyPhoneValidators: phone has required validator only after country selected & required', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    // 先選國家
    component.countryControl.setValue('TW');
    fixture.detectChanges();

    // required + 有國家 → phone 應同時有 required 與 phoneNumberValidator
    expect(component.phoneControl.hasValidator(Validators.required)).toBe(true);
    component.phoneControl.setValue(null);
    expect(component.phoneControl.hasError('required')).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Country select value changes
  // -------------------------------------------------------------------------
  it('should update phonePlaceholder when a country is selected', () => {
    fixture.detectChanges();
    component.countryControl.setValue('US');
    expect(component.phonePlaceholder()).not.toBe('');
  });

  it('should clear placeholder when country is set to null', () => {
    fixture.detectChanges();
    component.countryControl.setValue('US');
    expect(component.phonePlaceholder()).not.toBe('');
    component.countryControl.setValue(null);
    expect(component.phonePlaceholder()).toBe('');
  });

  it('should reset phoneControl when a new country is selected and phone has a value', () => {
    fixture.detectChanges();
    component.countryControl.setValue('US');
    component.phoneControl.setValue('+1 202 555 0123');
    component.countryControl.setValue('GB');
    expect(component.phoneControl.value).toBeNull();
  });

  // -------------------------------------------------------------------------
  // ControlValueAccessor
  // -------------------------------------------------------------------------
  it('writeValue with a valid E.164 number should set country and phone controls', () => {
    fixture.detectChanges();
    component.writeValue('+12025550156');
    expect(component.countryControl.value).toBe('US');
    expect(component.phoneControl.value).toBeTruthy();
  });

  it('writeValue with an unparseable value falls back to defaultCountryCode (TW)', () => {
    fixture.detectChanges();
    component.writeValue('not-a-number');
    expect(component.phoneControl.value).toBe('not-a-number');
    expect(component.countryControl.value).toBe('TW'); // 最終版 fallback 改為 defaultCountryCode
  });

  it('writeValue unparseable value uses custom defaultCountryCode', () => {
    fixture.componentRef.setInput('defaultCountryCode', 'JP');
    fixture.detectChanges();
    component.writeValue('not-a-number');
    expect(component.countryControl.value).toBe('JP');
  });

  it('writeValue with empty string resets phone and sets country to null when not required', () => {
    fixture.detectChanges();
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue('+1 202 555 0156', { emitEvent: false });
    component.writeValue('');
    expect(component.phoneControl.value).toBeNull();
    expect(component.countryControl.value).toBeNull(); // 非 required → null
  });

  it('writeValue with empty string sets country to default when required', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    component.writeValue('');
    expect(component.phoneControl.value).toBeNull();
    expect(component.countryControl.value).toBe('TW'); // required → default
  });

  it('setDisabledState(true) should disable both controls', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.countryControl.disabled).toBe(true);
    expect(component.phoneControl.disabled).toBe(true);
  });

  it('setDisabledState(false) should re-enable both controls', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    component.setDisabledState(false);
    expect(component.countryControl.disabled).toBe(false);
    expect(component.phoneControl.disabled).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Validator interface
  // -------------------------------------------------------------------------
  it('validate() returns phoneControl errors', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    component.countryControl.setValue('TW');
    component.phoneControl.setValue(null);

    const errors = component.validate(component.phoneControl);
    expect(errors?.['required']).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // onChange propagation
  // -------------------------------------------------------------------------
  it('should call onChange with null when phone is empty', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('TW');
    component.phoneControl.setValue(null);
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should call onChange with formatted number when valid', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('US');
    component.phoneControl.setValue('+12025550156');
    // 最後一次呼叫應帶國際格式字串
    const lastArg = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(typeof lastArg).toBe('string');
  });
});
