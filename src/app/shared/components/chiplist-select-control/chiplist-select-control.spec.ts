import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Validators } from '@angular/forms';
import { vi } from 'vitest';
import type { MatChipInputEvent } from '@angular/material/chips';
import type { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { ChiplistSelectControl } from './chiplist-select-control';

// 建立假的 MatChipInputEvent
function makeChipInputEvent(value: string): MatChipInputEvent {
  return {
    value,
    chipInput: { clear: vi.fn() },
  } as unknown as MatChipInputEvent;
}

// 建立假的 MatAutocompleteSelectedEvent
function makeAutocompleteEvent(viewValue: string): MatAutocompleteSelectedEvent {
  return {
    option: {
      viewValue,
      deselect: vi.fn(),
    },
  } as unknown as MatAutocompleteSelectedEvent;
}

describe('ChiplistSelectControl', () => {
  let component: ChiplistSelectControl;
  let fixture: ComponentFixture<ChiplistSelectControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChiplistSelectControl],
    }).compileComponents();

    fixture = TestBed.createComponent(ChiplistSelectControl);
    component = fixture.componentInstance;
    // 不在此 detectChanges，個別測試可先 setInput 再觸發 effect
  });

  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should start with empty selection and no value', () => {
    fixture.detectChanges();
    expect(component.selected()).toEqual([]);
    expect(component.chipControl.value).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Inputs: label / placeholder render
  // -------------------------------------------------------------------------
  it('should render the provided label', () => {
    fixture.componentRef.setInput('label', 'Habits');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('mat-label'))?.nativeElement as HTMLElement;
    expect(label.textContent).toContain('Habits');
  });

  // -------------------------------------------------------------------------
  // filteredOptions
  // -------------------------------------------------------------------------
  it('should filter options by typed input and exclude already-selected', () => {
    fixture.componentRef.setInput('options', ['hiking', 'swimming', 'traveling']);
    fixture.detectChanges();

    // 無輸入 → 全部可選
    expect(component.filteredOptions()).toEqual(['hiking', 'swimming', 'traveling']);

    // 輸入 'sw' → 只剩 swimming
    component.inputControl.setValue('sw');
    expect(component.filteredOptions()).toEqual(['swimming']);

    // 已選 swimming → 從可選清單排除
    component.inputControl.setValue('');
    component.selected.set(['swimming']);
    expect(component.filteredOptions()).toEqual(['hiking', 'traveling']);
  });

  it('filter should be case-insensitive', () => {
    fixture.componentRef.setInput('options', ['Hiking', 'Swimming']);
    fixture.detectChanges();
    component.inputControl.setValue('SWIM');
    expect(component.filteredOptions()).toEqual(['Swimming']);
  });

  // -------------------------------------------------------------------------
  // Validator: required
  // -------------------------------------------------------------------------
  it('should not have required validator when required is false', () => {
    fixture.detectChanges();
    expect(component.chipControl.hasValidator(Validators.required)).toBe(false);
    expect(component.validate(component.chipControl)).toBeNull();
  });

  it('should add required validator and report error when empty & required', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(component.chipControl.hasValidator(Validators.required)).toBe(true);
    // 空選取 → required error
    expect(component.validate(component.chipControl)?.['required']).toBeTruthy();
  });

  it('validate() should return null once a value is selected', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    component.selectedOption(makeAutocompleteEvent('hiking'));
    expect(component.validate(component.chipControl)).toBeNull();
  });

  it('should toggle required validator when required input changes', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    expect(component.chipControl.hasValidator(Validators.required)).toBe(true);

    fixture.componentRef.setInput('required', false);
    fixture.detectChanges();
    expect(component.chipControl.hasValidator(Validators.required)).toBe(false);
  });

  // -------------------------------------------------------------------------
  // selectedOption (autocomplete)
  // -------------------------------------------------------------------------
  it('selectedOption should add the chip and emit value', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);

    component.selectedOption(makeAutocompleteEvent('hiking'));

    expect(component.selected()).toEqual(['hiking']);
    expect(component.chipControl.value).toEqual(['hiking']);
    expect(spy).toHaveBeenCalledWith(['hiking']);
  });

  it('selectedOption should clear the text input and set justSelected', () => {
    fixture.detectChanges();
    component.inputControl.setValue('hik');
    component.selectedOption(makeAutocompleteEvent('hiking'));
    expect(component.inputControl.value).toBe('');
  });

  // -------------------------------------------------------------------------
  // add (chip input token end) + justSelected 去重
  // -------------------------------------------------------------------------
  it('add should append a free-form value when allowFreeForm is true', () => {
    fixture.componentRef.setInput('allowFreeForm', true);
    fixture.detectChanges();

    component.add(makeChipInputEvent('reading'));
    expect(component.selected()).toEqual(['reading']);
  });

  it('add should ignore free-form value when allowFreeForm is false and value not in options', () => {
    fixture.componentRef.setInput('allowFreeForm', false);
    fixture.componentRef.setInput('options', ['hiking', 'swimming']);
    fixture.detectChanges();

    component.add(makeChipInputEvent('reading')); // 不在 options
    expect(component.selected()).toEqual([]);

    component.add(makeChipInputEvent('hiking')); // 在 options
    expect(component.selected()).toEqual(['hiking']);
  });

  it('add should skip when justSelected is set (autocomplete dedupe)', () => {
    fixture.detectChanges();

    // 模擬：先透過 autocomplete 選了 swimming（會設 justSelected = true）
    component.selectedOption(makeAutocompleteEvent('swimming'));
    expect(component.selected()).toEqual(['swimming']);

    // 緊接著 token end 帶著殘留文字 'sw' 進來 → 應被略過
    component.add(makeChipInputEvent('sw'));
    expect(component.selected()).toEqual(['swimming']); // 不應出現 'sw'
  });

  it('add should work normally on the next token end after a skip', () => {
    fixture.detectChanges();

    component.selectedOption(makeAutocompleteEvent('swimming'));
    component.add(makeChipInputEvent('sw')); // 被略過，justSelected 歸 false

    // 再次純手動輸入 → 應正常加入
    component.add(makeChipInputEvent('reading'));
    expect(component.selected()).toEqual(['swimming', 'reading']);
  });

  it('add should trim whitespace', () => {
    fixture.detectChanges();
    component.add(makeChipInputEvent('  reading  '));
    expect(component.selected()).toEqual(['reading']);
  });

  it('add should ignore empty / whitespace-only value', () => {
    fixture.detectChanges();
    component.add(makeChipInputEvent('   '));
    expect(component.selected()).toEqual([]);
  });

  it('should not add duplicate values', () => {
    fixture.detectChanges();
    component.add(makeChipInputEvent('hiking'));
    component.add(makeChipInputEvent('hiking'));
    expect(component.selected()).toEqual(['hiking']);
  });

  // -------------------------------------------------------------------------
  // remove
  // -------------------------------------------------------------------------
  it('remove should drop the chip and emit updated value', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);

    component.add(makeChipInputEvent('hiking'));
    component.add(makeChipInputEvent('swimming'));
    component.remove('hiking');

    expect(component.selected()).toEqual(['swimming']);
    expect(spy).toHaveBeenLastCalledWith(['swimming']);
  });

  it('remove last chip should emit null', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.registerOnChange(spy);

    component.add(makeChipInputEvent('hiking'));
    component.remove('hiking');

    expect(component.selected()).toEqual([]);
    expect(component.chipControl.value).toBeNull();
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  // -------------------------------------------------------------------------
  // ControlValueAccessor: writeValue
  // -------------------------------------------------------------------------
  it('writeValue should populate selection from an array', () => {
    fixture.detectChanges();
    component.writeValue(['hiking', 'traveling']);
    expect(component.selected()).toEqual(['hiking', 'traveling']);
    expect(component.chipControl.value).toEqual(['hiking', 'traveling']);
  });

  it('writeValue with null should clear selection', () => {
    fixture.detectChanges();
    component.writeValue(['hiking']);
    component.writeValue(null);
    expect(component.selected()).toEqual([]);
    expect(component.chipControl.value).toBeNull();
  });

  it('writeValue should reset touched/pristine state (reset alignment)', () => {
    fixture.detectChanges();
    // 先製造 touched + dirty
    component.add(makeChipInputEvent('hiking'));
    expect(component.chipControl.touched).toBe(true);

    // 模擬外層 form.reset() → writeValue(null)
    component.writeValue(null);
    expect(component.chipControl.touched).toBe(false);
    expect(component.chipControl.pristine).toBe(true);
    expect(component.inputControl.value).toBe('');
  });

  // -------------------------------------------------------------------------
  // setDisabledState
  // -------------------------------------------------------------------------
  it('setDisabledState(true) should disable both controls and block mutations', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.chipControl.disabled).toBe(true);
    expect(component.inputControl.disabled).toBe(true);

    // disabled 時 add/selectedOption/remove 應無作用
    component.add(makeChipInputEvent('hiking'));
    component.selectedOption(makeAutocompleteEvent('swimming'));
    expect(component.selected()).toEqual([]);
  });

  it('setDisabledState(false) should re-enable both controls', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    component.setDisabledState(false);
    expect(component.chipControl.disabled).toBe(false);
    expect(component.inputControl.disabled).toBe(false);
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
});
