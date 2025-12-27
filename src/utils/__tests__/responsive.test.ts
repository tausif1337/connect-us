import { Dimensions } from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BREAKPOINTS,
} from '../responsive';

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 667 }),
}));

describe('Responsive Utilities', () => {
  describe('responsiveWidth', () => {
    it('should scale width correctly for base device (375px)', () => {
      const result = responsiveWidth(100);
      expect(result).toBe(100);
    });

    it('should return 0 for width 0', () => {
      const result = responsiveWidth(0);
      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      const result = responsiveWidth(-50);
      expect(typeof result).toBe('number');
    });

    it('should return rounded values', () => {
      const result = responsiveWidth(33.333);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('responsiveHeight', () => {
    it('should scale height correctly for base device (667px)', () => {
      const result = responsiveHeight(100);
      expect(result).toBe(100);
    });

    it('should return 0 for height 0', () => {
      const result = responsiveHeight(0);
      expect(result).toBe(0);
    });

    it('should return rounded values', () => {
      const result = responsiveHeight(50.75);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('responsiveFontSize', () => {
    it('should scale font size correctly', () => {
      const result = responsiveFontSize(16);
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle small font sizes', () => {
      const result = responsiveFontSize(10);
      expect(result).toBeGreaterThanOrEqual(10);
    });

    it('should handle large font sizes', () => {
      const result = responsiveFontSize(48);
      expect(typeof result).toBe('number');
    });
  });

  describe('Device type checks', () => {
    it('should correctly identify device size', () => {
      // For a 375px wide screen (base device)
      expect(isSmallDevice).toBe(false);
      expect(isMediumDevice).toBe(true);
      expect(isLargeDevice).toBe(false);
    });

    it('should export screen dimensions', () => {
      expect(SCREEN_WIDTH).toBe(375);
      expect(SCREEN_HEIGHT).toBe(667);
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(320);
      expect(BREAKPOINTS.md).toBe(375);
      expect(BREAKPOINTS.lg).toBe(414);
      expect(BREAKPOINTS.xl).toBe(480);
    });

    it('should have all required breakpoints', () => {
      expect(BREAKPOINTS).toHaveProperty('sm');
      expect(BREAKPOINTS).toHaveProperty('md');
      expect(BREAKPOINTS).toHaveProperty('lg');
      expect(BREAKPOINTS).toHaveProperty('xl');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large values', () => {
      const result = responsiveWidth(10000);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should handle decimal values', () => {
      const widthResult = responsiveWidth(123.456);
      const heightResult = responsiveHeight(234.567);
      const fontResult = responsiveFontSize(18.75);

      expect(Number.isInteger(widthResult)).toBe(true);
      expect(Number.isInteger(heightResult)).toBe(true);
      expect(Number.isInteger(fontResult)).toBe(true);
    });
  });
});
