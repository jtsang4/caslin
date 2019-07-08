import { isStringOrNonEmptyArray } from '../util';

describe('Utils', () => {
  describe('isStringOrNonEmptyArray()', () => {
    it('should return true when passing a string', function () {
      const result = isStringOrNonEmptyArray('foo');
      expect(result).toBe(true);
    });

    it('should return true when passing a array of string', function () {
      const result = isStringOrNonEmptyArray(['foo', 'bar']);
      expect(result).toBe(true);
    });

    it('should return false when passing a value which is not string or string array', function () {
      const result = isStringOrNonEmptyArray(1);
      expect(result).toBe(false);
    });
  });
});
