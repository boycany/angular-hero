import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
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
    await fixture.whenStable();
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Input: class bindings
  // -------------------------------------------------------------------------
  it('should apply the default countryFieldClass (field__country--default)', () => {
    expect(fixture.nativeElement.querySelectorAll('div.field__country--default').length).toBeGreaterThanOrEqual(1);
  });

  it('should apply the default phoneFieldClass (field__phone--default)', () => {
    expect(fixture.nativeElement.querySelectorAll('div.field__phone--default').length).toBeGreaterThanOrEqual(1);
  });

  it('should apply custom countryFieldClass', () => {
    fixture.componentRef.setInput('countryFieldClass', ['field__country--custom']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div.field__country--custom')).toBeTruthy();
  });

  it('should apply custom phoneFieldClass', () => {
    fixture.componentRef.setInput('phoneFieldClass', ['field__phone--custom']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div.field__phone--custom')).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Initialisation
  // -------------------------------------------------------------------------
  it('should populate the countries list from libphonenumber', () => {
    expect(component.countries.length).toBeGreaterThan(0);
    expect(component.countries[0]).toHaveProperty('code');
    expect(component.countries[0]).toHaveProperty('callingCode');
  });

  it('should start with empty phonePlaceholder', () => {
    expect(component.phonePlaceholder()).toBe('');
  });

  // -------------------------------------------------------------------------
  // Country select value changes
  // -------------------------------------------------------------------------
  it('should update phonePlaceholder when a country is selected', () => {
    component.countryControl.setValue('US');
    expect(component.phonePlaceholder()).not.toBe('');
  });

  it('should reset phoneControl when a new country is selected and phone has a value', () => {
    component.countryControl.setValue('US');
    component.phoneControl.setValue('+1 202 555 0123');
    component.countryControl.setValue('GB');
    expect(component.phoneControl.value).toBeNull();
  });

  it('should clear validators and return early when country is set to null', () => {
    component.countryControl.setValue('US');
    const clearSpy = vi.spyOn(component.phoneControl, 'clearValidators');
    component.countryControl.setValue(null);
    expect(clearSpy).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // updateValue()
  // -------------------------------------------------------------------------
  it('should call onChange(null) when both country and phone are absent', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.updateValue();
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should call onChange(null) when country is set but phone is empty', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue(null, { emitEvent: false });
    component.updateValue();
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should emit formatted international number for a valid US phone', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue('+1 202-555-0156', { emitEvent: false });
    component.updateValue();
    const lastCall: string | null = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(lastCall).toMatch(/^\+1/);
  });

  it('should emit raw phone when parsed number is invalid', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue('123', { emitEvent: false });
    component.updateValue();
    expect(spy).toHaveBeenCalledWith('123');
  });

  it('should emit raw phone when parsePhoneNumber throws', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue('not-a-phone-!!!', { emitEvent: false });
    component.updateValue();
    expect(spy).toHaveBeenCalledWith('not-a-phone-!!!');
  });

  // -------------------------------------------------------------------------
  // ControlValueAccessor
  // -------------------------------------------------------------------------
  it('registerOnChange should replace the onChange handler', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    expect(component.onChange).toBe(spy);
  });

  it('registerOnTouched should replace the onTouched handler', () => {
    const spy = vi.fn();
    component.registerOnTouched(spy);
    expect(component.onTouched).toBe(spy);
  });

  it('should call onTouched when the phone input is blurred', () => {
    const spy = vi.fn();
    component.registerOnTouched(spy);
    query<HTMLInputElement>(fixture, 'input[type="text"]').dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalled();
  });

  it('writeValue with a valid E.164 number should set country and phone controls', () => {
    component.writeValue('+12025550156');
    expect(component.countryControl.value).toBe('US');
    expect(component.phoneControl.value).toBeTruthy();
  });

  it('writeValue with an unparseable value should fall back to setting phone directly', () => {
    component.writeValue('not-a-number');
    expect(component.phoneControl.value).toBe('not-a-number');
    expect(component.countryControl.value).toBe('US');
  });

  it('writeValue with empty string should reset phoneControl', () => {
    component.countryControl.setValue('US', { emitEvent: false });
    component.phoneControl.setValue('+1 202 555 0156', { emitEvent: false });
    component.writeValue('');
    expect(component.phoneControl.value).toBeNull();
  });

  it('setDisabledState(true) should disable both controls', () => {
    component.setDisabledState(true);
    expect(component.countryControl.disabled).toBe(true);
    expect(component.phoneControl.disabled).toBe(true);
  });

  it('setDisabledState(false) should enable both controls', () => {
    component.setDisabledState(true);
    component.setDisabledState(false);
    expect(component.countryControl.enabled).toBe(true);
    expect(component.phoneControl.enabled).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Validator
  // -------------------------------------------------------------------------
  it('validate() should return null when phoneControl has no errors', () => {
    component.phoneControl.setErrors(null);
    expect(component.validate(new FormControl(''))).toBeNull();
  });

  it('validate() should return phoneControl errors when they exist', () => {
    component.phoneControl.setErrors({ phoneNumberInvalid: true });
    expect(component.validate(new FormControl(''))).toEqual({ phoneNumberInvalid: true });
  });

  // -------------------------------------------------------------------------
  // Template: error messages
  // -------------------------------------------------------------------------
  it('should show "Phone number is invalid" error in template', () => {
    component.countryControl.setValue('US');
    component.phoneControl.markAsTouched();
    component.phoneControl.setErrors({ phoneNumberInvalid: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Phone number is invalid');
  });

  it('should show parseError message via removeUnderline + titlecase pipe', () => {
    component.countryControl.setValue('US');
    component.phoneControl.markAsTouched();
    component.phoneControl.setErrors({ parseError: 'not_a_number' });
    fixture.detectChanges();
    // "not_a_number" → removeUnderline → "not a number" → titlecase → "Not A Number"
    expect(fixture.nativeElement.textContent).toContain('Not A Number');
  });
});
