import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { TitleCasePipe } from '@angular/common';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms'
import { RemoveUnderlinePipe } from '../../pipes/remove-underline.pipe';
import {
  CountryCallingCode,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from 'libphonenumber-js/max';
import { CustomErrorStateMatcher } from '../../utilities/custom-error-state-matcher';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { phoneNumberValidator } from '../../validators/phone-number-validator';
import { getPhoneNumberPlaceholder } from '../../helpers/get-phone-number-placeholder';

export interface Country {
  code: CountryCode;
  callingCode: CountryCallingCode;
}

@Component({
  selector: 'app-phone-number-control',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    RemoveUnderlinePipe,
    TitleCasePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './phone-number-control.html',
  styleUrl: './phone-number-control.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneNumberControl),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneNumberControl),
      multi: true,
    },
  ],
})
export class PhoneNumberControl implements ControlValueAccessor, Validator {
  // styles
  phoneFieldClass = input<string[]>(['field__phone--default']);
  countryFieldClass = input<string[]>(['field__country--default']);

  // country control
  countryControl = new FormControl<CountryCode | null>(null, {
    nonNullable: true,
  });
  countries: Country[] = getCountries().map((code) => ({
    code,
    callingCode: getCountryCallingCode(code),
  }));

  // phone control
  phoneControl = new FormControl<string | null>(null, {
    nonNullable: false,
  });
  phonePlaceholder = signal('');

  
  onChange = (val: string | null) => {
    // console.log('[onChange] phone number control changed', val);
  };
  onTouched = () => {
    // console.log('[onTouched] phone number control touched');
  };

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  errorStateMatcher = new CustomErrorStateMatcher();

  constructor() {
    this.countryControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((countryCode) => {
      this.phoneControl.clearValidators();
      if (!countryCode) return;

      if (this.phoneControl.value) {
        this.phoneControl.reset();
      }
      this.phoneControl.addValidators(phoneNumberValidator(countryCode));
      this.phonePlaceholder.set(getPhoneNumberPlaceholder(countryCode));
      this.updateValue();
    });

    this.phoneControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((phone) => {
      this.updateValue();
    });
  }

  updateValue() {
    const country = this.countryControl.value;
    const phone = this.phoneControl.value;

    if (country && phone) {
      try {
        const parsedPhone = parsePhoneNumber(phone, {
          defaultCountry: country,
          extract: false,
        });
        if (parsedPhone && parsedPhone.isValid()) {
          this.onChange(parsedPhone.formatInternational());
        } else {
          this.onChange(phone);
        }
      } catch (e) {
        console.log('Error parsing phone number :>> ', e);
        this.onChange(phone);
      }
    } else {
      this.onChange(null);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.countryControl.disable();
      this.phoneControl.disable();
    } else {
      this.countryControl.enable();
      this.phoneControl.enable();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.phoneControl.errors;
  }

  writeValue(value: string): void {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          this.countryControl.setValue(parsed.country ?? 'US', {
            emitEvent: true,
          });
          this.phoneControl.setValue(parsed.formatInternational(), {
            emitEvent: true,
          });
        }
      } catch (e) {
        // If parse fails, just put it in number
        console.log('Error parsing phone number :>> ', e);
        this.phoneControl.setValue(value, { emitEvent: false });
        this.countryControl.setValue('US', { emitEvent: false });
      }
    } else {
      this.phoneControl.reset();
    }
  }
}
