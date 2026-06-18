import { FormControl } from '@angular/forms';
import { utilityRegexValidator } from './utility-regex-validator';

describe('utilityRegexValidator', () => {
  const regex = /^[a-zA-Z]+$/;
  const error = { onlyLetters: true };
  const validator = utilityRegexValidator(regex, error);

  it('should return null when the value matches the regex', () => {
    const control = new FormControl('abc');
    expect(validator(control)).toBeNull();
  });

  it('should return the error object when the value does not match the regex', () => {
    const control = new FormControl('123');
    expect(validator(control)).toEqual(error);
  });

  it('should return null for an empty string', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for a null value', () => {
    const control = new FormControl(null);
    expect(validator(control)).toBeNull();
  });

  it('should return the error object for a mixed string', () => {
    const control = new FormControl('abc123');
    expect(validator(control)).toEqual(error);
  });
});
