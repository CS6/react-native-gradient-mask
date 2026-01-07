import type { StyleProp, ViewStyle } from 'react-native';

export type GradientMaskViewProps = {
  /**
   * Gradient colors array (processed colors from processColor)
   * Use alpha values to control opacity
   * e.g., ['rgba(0,0,0,0)', 'rgba(0,0,0,1)'] = transparent to opaque
   */
  colors: (number | null)[];

  /**
   * Position of each color (0-1)
   * e.g., [0, 0.3, 1] means first color at 0%, second at 30%, third at 100%
   */
  locations: number[];

  /**
   * Gradient direction
   * 'top' = top transparent, bottom opaque
   * 'bottom' = bottom transparent, top opaque
   * 'left' = left transparent, right opaque
   * 'right' = right transparent, left opaque
   */
  direction?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Mask effect intensity (0-1)
   * 0 = no gradient effect (content fully visible)
   * 1 = full gradient effect
   * @default 1
   */
  maskOpacity?: number;

  /**
   * Style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Children
   */
  children?: React.ReactNode;
};
