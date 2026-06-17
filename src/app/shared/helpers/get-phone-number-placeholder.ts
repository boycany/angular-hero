import { CountryCode, getExampleNumber } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';

export function getPhoneNumberPlaceholder(countryCode?: CountryCode): string {
    return getExampleNumber(countryCode ?? 'US', examples)?.formatInternational() ?? '';
}