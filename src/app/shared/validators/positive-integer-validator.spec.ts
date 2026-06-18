import { FormControl } from '@angular/forms';
import { positiveIntegerValidator } from './positive-integer-validator';

describe('positiveIntegerValidator', () => {
  const validator = positiveIntegerValidator();

  it('should return null for positive integers', () => {
    const control = new FormControl('123');
    expect(validator(control)).toBeNull();
  });

  it('should return the error object for negative integers', () => {
    const control = new FormControl('-123');
    expect(validator(control)).toEqual({ notPositiveInteger: true });
  });

  it('should return the error object for strings with letters', () => {
    const control = new FormControl('abc');
    expect(validator(control)).toEqual({ notPositiveInteger: true });
  });

  it('should return the error object for strings with special characters', () => {
    const control = new FormControl('!@#');
    expect(validator(control)).toEqual({ notPositiveInteger: true });
  });

  it('should return null for an empty string', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for a null value', () => {
    const control = new FormControl(null);
    expect(validator(control)).toBeNull();
  });
});
