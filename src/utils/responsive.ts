import { Dimensions } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scale functions
const scale = SCREEN_WIDTH / 375; // iPhone X width as base
const verticalScale = SCREEN_HEIGHT / 667; // iPhone X height as base

// Scale functions for different dimensions
export function responsiveWidth(width: number): number {
  return Math.round(width * scale);
}

export function responsiveHeight(height: number): number {
  return Math.round(height * verticalScale);
}

export function responsiveFontSize(fontSize: number): number {
  const newSize = fontSize * scale;
  return Math.round(newSize);
}

// Device type checks
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Export screen dimensions
export { SCREEN_WIDTH, SCREEN_HEIGHT };

// Common breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 480,
};