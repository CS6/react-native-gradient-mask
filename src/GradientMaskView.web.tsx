import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { GradientMaskViewProps } from './GradientMask.types';

/**
 * 將 processColor 處理過的顏色值轉回 rgba 字串
 */
function colorToRgba(color: number | null): string {
  if (color === null || color === undefined) {
    return 'rgba(0, 0, 0, 0)';
  }

  // processColor 在 web 上回傳的格式是 AARRGGBB (32-bit integer)
  const intValue = color >>> 0; // 確保是 unsigned
  const a = ((intValue >> 24) & 0xff) / 255;
  const r = (intValue >> 16) & 0xff;
  const g = (intValue >> 8) & 0xff;
  const b = intValue & 0xff;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * 根據 direction 取得 CSS linear-gradient 的方向
 */
function getGradientDirection(direction: GradientMaskViewProps['direction']): string {
  switch (direction) {
    case 'top':
      return 'to bottom'; // 頂部透明 → 底部不透明
    case 'bottom':
      return 'to top'; // 底部透明 → 頂部不透明
    case 'left':
      return 'to right'; // 左側透明 → 右側不透明
    case 'right':
      return 'to left'; // 右側透明 → 左側不透明
    default:
      return 'to bottom';
  }
}

/**
 * 建立 CSS linear-gradient 字串
 */
function buildGradientString(
  colors: (number | null)[],
  locations: number[],
  direction: GradientMaskViewProps['direction']
): string {
  const gradientDirection = getGradientDirection(direction);

  const colorStops = colors.map((color, index) => {
    const rgba = colorToRgba(color);
    const location = locations[index] !== undefined ? locations[index] * 100 : (index / (colors.length - 1)) * 100;
    return `${rgba} ${location}%`;
  });

  return `linear-gradient(${gradientDirection}, ${colorStops.join(', ')})`;
}

/**
 * 根據 maskOpacity 調整顏色的 alpha 值
 * maskOpacity = 0 時，所有顏色變為完全不透明（無遮罩效果）
 * maskOpacity = 1 時，保持原本的 alpha 值
 */
function adjustColorsForOpacity(
  colors: (number | null)[],
  maskOpacity: number
): (number | null)[] {
  if (maskOpacity >= 1) return colors;
  if (maskOpacity <= 0) {
    // 全部變成不透明黑色，表示內容完全可見
    return colors.map(() => 0xff000000);
  }

  return colors.map((color) => {
    if (color === null || color === undefined) return color;
    const intValue = color >>> 0;
    const a = ((intValue >> 24) & 0xff) / 255;
    const r = (intValue >> 16) & 0xff;
    const g = (intValue >> 8) & 0xff;
    const b = intValue & 0xff;
    // 根據 maskOpacity 調整 alpha：當 maskOpacity = 0 時 alpha 趨近於 1（完全可見）
    const adjustedAlpha = a + (1 - a) * (1 - maskOpacity);
    return ((Math.round(adjustedAlpha * 255) << 24) | (r << 16) | (g << 8) | b) >>> 0;
  });
}

/**
 * GradientMaskView - Web 實作
 * 使用 CSS mask-image 搭配 linear-gradient 實現漸層遮罩效果
 */
export default function GradientMaskView(props: GradientMaskViewProps) {
  const {
    colors,
    locations,
    direction = 'top',
    maskOpacity = 1,
    style,
    children,
  } = props;

  const maskStyle = React.useMemo(() => {
    if (maskOpacity <= 0) {
      // 無遮罩效果
      return {};
    }

    const adjustedColors = adjustColorsForOpacity(colors, maskOpacity);
    const gradientString = buildGradientString(adjustedColors, locations, direction);

    return {
      WebkitMaskImage: gradientString,
      maskImage: gradientString,
    };
  }, [colors, locations, direction, maskOpacity]);

  return (
    <View style={[styles.container, style, maskStyle as any]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
