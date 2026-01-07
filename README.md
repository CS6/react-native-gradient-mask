<p align="center">
  <h1 align="center">react-native-gradient-mask</h1>
</p>

<p align="center">
  <b>A native gradient mask component for React Native</b>
</p>

<p align="center">
  Create beautiful fade effects, list masks, and smooth gradient transitions with native performance and Reanimated animation support.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-gradient-mask">
    <img src="https://img.shields.io/npm/v/react-native-gradient-mask.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/react-native-gradient-mask">
    <img src="https://img.shields.io/npm/dm/react-native-gradient-mask.svg" alt="npm downloads" />
  </a>
  <img src="https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-brightgreen.svg" alt="platforms" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
</p>

<p align="center">
  <a href="./README.zh-TW.md">繁體中文</a> •
  <a href="./README.ja.md">日本語</a>
</p>

---

## Demo

<p align="center">
  <table>
    <tr>
      <td align="center"><b>iOS</b></td>
      <td align="center"><b>Android</b></td>
    </tr>
    <tr>
      <td><a href="./images/ios  Demo Video.webm"><img src="./images/ios.png" alt="iOS Demo" width="280" /></a></td>
      <td><a href="./images/android.mp4"><img src="./images/android.png" alt="Android Demo" width="280" /></a></td>
    </tr>
  </table>
</p>

## Features

| Feature | Description |
|---------|-------------|
| **Cross-platform** | iOS, Android, and Web support |
| **Native Performance** | iOS: `CAGradientLayer` • Android: `Bitmap` + `PorterDuff` • Web: CSS `mask-image` |
| **Reanimated Support** | Smooth 60fps mask animations with `AnimatedGradientMaskView` |
| **Flexible** | Custom colors, locations, directions, and mask intensity |
| **TypeScript** | Full type definitions included |

## Installation

```bash
npm install react-native-gradient-mask
```

```bash
yarn add react-native-gradient-mask
```

### Requirements

| Dependency | Version |
|------------|---------|
| Expo SDK | 50+ |
| React Native | 0.73+ |
| react-native-reanimated | >= 3.0.0 *(optional)* |

### Setup

<details>
<summary><b>iOS</b></summary>

```bash
cd ios && pod install
```
</details>

<details>
<summary><b>Android</b></summary>

No additional setup required. Auto-linking enabled.
</details>

---

## Quick Start

```tsx
import { processColor } from 'react-native';
import { GradientMaskView } from 'react-native-gradient-mask';

const colors = [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
];

export default function App() {
  return (
    <GradientMaskView
      colors={colors}
      locations={[0, 1]}
      direction="top"
      style={{ flex: 1 }}
    >
      <YourContent />
    </GradientMaskView>
  );
}
```

---

## API Reference

### Components

| Component | Description |
|-----------|-------------|
| `GradientMaskView` | Basic gradient mask component |
| `AnimatedGradientMaskView` | Animated gradient mask with Reanimated support |

### Props

#### GradientMaskView

| Prop | Type | Required | Default | Description |
|------|------|:--------:|---------|-------------|
| `colors` | `(number \| null)[]` | Yes | - | Gradient colors (use `processColor()`) |
| `locations` | `number[]` | Yes | - | Color positions (0-1) |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | No | `'top'` | Gradient direction |
| `maskOpacity` | `number` | No | `1` | Mask intensity (0-1) |
| `style` | `ViewStyle` | No | - | Container style |
| `children` | `ReactNode` | No | - | Content to mask |

#### AnimatedGradientMaskView

Same as `GradientMaskView`, but `maskOpacity` accepts `SharedValue<number>` for animations.

### Direction Guide

| Direction | Effect |
|-----------|--------|
| `top` | Top transparent → Bottom opaque |
| `bottom` | Bottom transparent → Top opaque |
| `left` | Left transparent → Right opaque |
| `right` | Right transparent → Left opaque |

---

## Examples

### Basic Fade Effect

```tsx
import { processColor } from 'react-native';
import { GradientMaskView } from 'react-native-gradient-mask';

const colors = [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,0.5)'),
  processColor('rgba(0,0,0,1)'),
];

function FadeExample() {
  return (
    <GradientMaskView
      colors={colors}
      locations={[0, 0.3, 1]}
      direction="top"
      style={{ flex: 1 }}
    >
      <ScrollView>
        <Text>Content with fade effect</Text>
      </ScrollView>
    </GradientMaskView>
  );
}
```

### Animated Mask with Reanimated

```tsx
import { processColor } from 'react-native';
import { AnimatedGradientMaskView } from 'react-native-gradient-mask';
import { useSharedValue, withTiming } from 'react-native-reanimated';

function AnimatedExample() {
  const maskOpacity = useSharedValue(0);

  const showMask = () => {
    maskOpacity.value = withTiming(1, { duration: 600 });
  };

  const hideMask = () => {
    maskOpacity.value = withTiming(0, { duration: 400 });
  };

  return (
    <AnimatedGradientMaskView
      colors={[
        processColor('rgba(0,0,0,0)'),
        processColor('rgba(0,0,0,1)'),
      ]}
      locations={[0, 1]}
      maskOpacity={maskOpacity}
      style={{ flex: 1 }}
    >
      <YourContent />
    </AnimatedGradientMaskView>
  );
}
```

### Chat List with Dynamic Mask

```tsx
import { useMemo, useCallback, useRef } from 'react';
import { processColor } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AnimatedGradientMaskView } from 'react-native-gradient-mask';
import { useSharedValue, withTiming, cancelAnimation, Easing } from 'react-native-reanimated';

function ChatList({ messages }) {
  const maskOpacity = useSharedValue(0);
  const isAtBottomRef = useRef(false);

  const maskColors = useMemo(() => [
    processColor('rgba(0,0,0,0)'),
    processColor('rgba(0,0,0,0)'),
    processColor('rgba(0,0,0,0.2)'),
    processColor('rgba(0,0,0,0.6)'),
    processColor('rgba(0,0,0,0.9)'),
    processColor('rgba(0,0,0,1)'),
  ], []);

  const handleScroll = useCallback((e) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const isAtBottom = distanceFromBottom <= 30;

    if (isAtBottom !== isAtBottomRef.current) {
      isAtBottomRef.current = isAtBottom;
      cancelAnimation(maskOpacity);
      maskOpacity.value = withTiming(isAtBottom ? 1 : 0, {
        duration: isAtBottom ? 600 : 400,
        easing: isAtBottom ? Easing.in(Easing.quad) : Easing.out(Easing.quad),
      });
    }
  }, []);

  return (
    <AnimatedGradientMaskView
      colors={maskColors}
      locations={[0, 0.42, 0.45, 0.48, 0.5, 1]}
      direction="top"
      maskOpacity={maskOpacity}
      style={{ flex: 1 }}
    >
      <FlashList
        data={messages}
        renderItem={({ item }) => <MessageItem item={item} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </AnimatedGradientMaskView>
  );
}
```

---

## Tips & Best Practices

### Always use `processColor()`

```tsx
// ✅ Correct
const colors = [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
];

// ❌ Wrong - won't work
const colors = [
  'rgba(0,0,0,0)',
  'rgba(0,0,0,1)',
];
```

### Optimize with `useMemo`

```tsx
const maskColors = useMemo(() => [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
], []);
```

### Avoid Flickering

```tsx
import { cancelAnimation } from 'react-native-reanimated';

// Cancel previous animation before starting new one
cancelAnimation(maskOpacity);
maskOpacity.value = withTiming(newValue, { duration: 300 });
```

---

## Platform Support

| Platform | Implementation | Status |
|----------|----------------|:------:|
| iOS | `CAGradientLayer` | ✅ |
| Android | `Bitmap` + `LinearGradient` + `PorterDuff` | ✅ |
| Web | CSS `mask-image` + `linear-gradient` | ✅ |

---

## License

MIT © [DaYuan Lin (CS6)](https://github.com/CS6)

---

<p align="center">
  <sub>Built with ❤️ for the React Native community</sub>
</p>
