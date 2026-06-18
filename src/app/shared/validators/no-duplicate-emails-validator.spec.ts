import { FormArray, FormControl } from '@angular/forms';

import { noDuplicateEmailsValidator } from './no-duplicate-emails-validator';

describe('noDuplicateEmailsValidator', () => {
  const validator = noDuplicateEmailsValidator();

  // 工具：用一組字串值建立 FormArray
  function makeArray(values: string[]): FormArray<FormControl<string>> {
    return new FormArray(values.map((v) => new FormControl(v, { nonNullable: true })));
  }

  it('should return null for an empty array', () => {
    expect(validator(makeArray([]))).toBeNull();
  });

  it('should return null for a single email', () => {
    expect(validator(makeArray(['a@example.com']))).toBeNull();
  });

  it('should return null for distinct emails', () => {
    expect(validator(makeArray(['a@example.com', 'b@example.com']))).toBeNull();
  });

  it('should return { duplicate: true } for exact duplicates', () => {
    expect(validator(makeArray(['a@example.com', 'a@example.com']))).toEqual({ duplicate: true });
  });

  it('should detect duplicates case-insensitively', () => {
    expect(validator(makeArray(['A@Example.com', 'a@example.com']))).toEqual({ duplicate: true });
  });

  it('should detect duplicates ignoring surrounding whitespace', () => {
    expect(validator(makeArray(['  a@example.com  ', 'a@example.com']))).toEqual({
      duplicate: true,
    });
  });

  it('should ignore empty / whitespace-only values when checking duplicates', () => {
    // 兩個空值不算重複（會被 filter 掉）
    expect(validator(makeArray(['', '']))).toBeNull();
    expect(validator(makeArray(['   ', '']))).toBeNull();
  });

  it('should not be tripped up by empty values mixed with one real email', () => {
    expect(validator(makeArray(['a@example.com', '', '   ']))).toBeNull();
  });

  it('should detect duplicates even when empty values are present', () => {
    expect(validator(makeArray(['a@example.com', '', 'a@example.com']))).toEqual({
      duplicate: true,
    });
  });

  it('should handle three identical emails', () => {
    expect(validator(makeArray(['x@x.com', 'x@x.com', 'x@x.com']))).toEqual({ duplicate: true });
  });

  it('should return null when only one of several emails differs in case but values are actually unique', () => {
    // 確認大小寫正規化不會誤判不同的 email
    expect(validator(makeArray(['a@example.com', 'B@example.com']))).toBeNull();
  });

  it('should handle null control values gracefully', () => {
    // 模擬 control.value 為 null 的情況（?? '' 應接住）
    const array = new FormArray([
      new FormControl<string | null>(null),
      new FormControl<string | null>('a@example.com'),
    ]);
    expect(validator(array)).toBeNull();
  });
});
