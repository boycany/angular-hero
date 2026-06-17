import { FormControl } from '@angular/forms';

import { phoneNumberValidator } from './phone-number-validator';

// ---------------------------------------------------------------------------
// Helper: build a FormControl and run the validator on it
// ---------------------------------------------------------------------------
function validate(value: string | null, country?: Parameters<typeof phoneNumberValidator>[0]) {
  const control = new FormControl(value);
  const validator = country ? phoneNumberValidator(country) : phoneNumberValidator();
  return validator(control);
}

describe('phoneNumberValidator', () => {
  // -------------------------------------------------------------------------
  // Empty / falsy value → always null (skip validation)
  // -------------------------------------------------------------------------
  it('should return null when control value is null', () => {
    expect(validate(null)).toBeNull();
  });

  it('should return null when control value is empty string', () => {
    expect(validate('')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Default country (US)
  // -------------------------------------------------------------------------
  it('should default to US country when none is specified', () => {
    // Valid US number without specifying country → should pass
    expect(validate('+12025550156')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Valid number
  // -------------------------------------------------------------------------
  it('should return null for a valid US number with country US', () => {
    expect(validate('+12025550156', 'US')).toBeNull();
  });

  it('should return null for a valid DE number with country DE', () => {
    // +49 30 12345678 is a valid German landline format
    expect(validate('+493012345678', 'DE')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Country mismatch → { phoneNumberInvalid: true }
  // -------------------------------------------------------------------------
  it('should return { phoneNumberInvalid } when the number belongs to a different country', () => {
    // US number submitted against GB country
    expect(validate('+12025550156', 'GB')).toEqual({ phoneNumberInvalid: true });
  });

  // -------------------------------------------------------------------------
  // isValid() === false → { phoneNumberInvalid: true }
  // The Ofcom-reserved UK testing range (07700 9XXXXX) parses as GB but
  // isValid() returns false in libphonenumber-js.
  // -------------------------------------------------------------------------
  it('should return { phoneNumberInvalid } when the number parses but isValid() is false', () => {
    expect(validate('+447700900123', 'GB')).toEqual({ phoneNumberInvalid: true });
  });

  // -------------------------------------------------------------------------
  // ParseError thrown → { parseError: e.message }
  // A garbage non-numeric string causes ParseError: NOT_A_NUMBER
  // -------------------------------------------------------------------------
  it('should return { parseError } when libphonenumber throws a ParseError', () => {
    const result = validate('not-a-phone-!!!', 'US');
    expect(result).toEqual({ parseError: 'NOT_A_NUMBER' });
  });
});
