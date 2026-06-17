import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  CountryCode,
  ParseError,
  parsePhoneNumberWithError,
  PhoneNumber,
} from 'libphonenumber-js/max';

export function phoneNumberValidator(country: CountryCode = 'US'): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return null;
    }

    const error: ValidationErrors = { phoneNumberInvalid: true };

    let parsedNumber: PhoneNumber | undefined;

    try {
      parsedNumber = parsePhoneNumberWithError(control.value ?? '', {
        defaultCountry: country,
        extract: false,
      });
    } catch (e) {
      if (e instanceof ParseError) {
        console.log('ParseError :>> ', e.message);
        return { parseError: e.message };
      } else {
        console.log('e :>> ', e);
        return error;
      }
    }

    if (!parsedNumber) {
      return error;
    }

    if (parsedNumber.country !== country) {
      return error;
    }

    const isValid = parsedNumber?.isValid();

    return isValid === false ? error : null;
  };
}
