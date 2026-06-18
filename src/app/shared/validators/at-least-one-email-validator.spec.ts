import { FormArray, FormControl } from '@angular/forms';

import { atLeastOneEmailValidator } from './at-least-one-email-validator';

describe('atLeastOneEmailValidator', () => {
  const validator = atLeastOneEmailValidator();

  function makeArray(values: string[]): FormArray<FormControl<string>> {
    return new FormArray(values.map((v) => new FormControl(v, { nonNullable: true })));
  }

  it('should return { required: true } for an empty array', () => {
    expect(validator(makeArray([]))).toEqual({ required: true });
  });

  it('should return { required: true } when all values are empty strings', () => {
    expect(validator(makeArray(['', '']))).toEqual({ required: true });
  });

  it('should return { required: true } when all values are whitespace only', () => {
    expect(validator(makeArray(['   ', '\t', ' ']))).toEqual({ required: true });
  });

  it('should return null when at least one non-empty value exists', () => {
    expect(validator(makeArray(['a@example.com']))).toBeNull();
  });

  it('should return null when one of several values is non-empty', () => {
    expect(validator(makeArray(['', 'a@example.com', '']))).toBeNull();
  });

  it('should return null even if the value is not a valid email (only checks presence)', () => {
    // 這支只驗「有沒有東西」，格式由別的 validator 負責
    expect(validator(makeArray(['not-an-email']))).toBeNull();
  });

  it('should treat a value with surrounding whitespace as present after trim', () => {
    expect(validator(makeArray(['  a@example.com  ']))).toBeNull();
  });

  it('should return { required: true } for a null control value', () => {
    // control.value 不是陣列時，Array.isArray 為 false → required
    const control = new FormControl<string[] | null>(null);
    expect(validator(control)).toEqual({ required: true });
  });

  it('should handle an array containing null entries gracefully', () => {
    // 對應 (v ?? '') 的防護
    const array = new FormArray([
      new FormControl<string | null>(null),
      new FormControl<string | null>(null),
    ]);
    expect(validator(array)).toEqual({ required: true });
  });

  it('should return null when a null entry coexists with a real value', () => {
    const array = new FormArray([
      new FormControl<string | null>(null),
      new FormControl<string | null>('a@example.com'),
    ]);
    expect(validator(array)).toBeNull();
  });
});