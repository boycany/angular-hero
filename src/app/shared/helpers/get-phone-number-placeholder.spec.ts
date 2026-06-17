import { getPhoneNumberPlaceholder } from './get-phone-number-placeholder'

describe('getPhoneNumPlaceholder', () => {
    it('should return a non-empty placeholder for a valid country code', () => {
      const result = getPhoneNumberPlaceholder('US');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  
    it('should return a US placeholder when no country code is provided', () => {
      const withDefault = getPhoneNumberPlaceholder();
      const explicitUS = getPhoneNumberPlaceholder('US');
      expect(withDefault).toBe(explicitUS);
    });
  
    it('should return a placeholder for another valid country code', () => {
      const result = getPhoneNumberPlaceholder('GB');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  
    it('should return a string in international format (starts with +)', () => {
      const result = getPhoneNumberPlaceholder('US');
      expect(result.startsWith('+')).toBe(true);
    });
  });