import { RemoveUnderlinePipe } from './remove-underline.pipe';

describe('RemoveUnderlinePipe', () => {
  let pipe: RemoveUnderlinePipe;

  beforeEach(() => {
    pipe = new RemoveUnderlinePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // value 存在 → 走 value?.toString().replace(...) 這條
  it('should replace a single underscore with a space', () => {
    expect(pipe.transform('hello_world')).toBe('hello world');
  });

  it('should replace multiple underscores (global flag)', () => {
    expect(pipe.transform('a_b_c_d')).toBe('a b c d');
  });

  it('should return the string unchanged when there is no underscore', () => {
    expect(pipe.transform('nochange')).toBe('nochange');
  });

  it('should handle an empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  // value 為 null → 觸發 ?. 短路，再走 ?? '' 這條
  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  // value 為 undefined → 同樣觸發 ?? '' 分支
  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});