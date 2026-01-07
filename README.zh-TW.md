<p align="center">
  <h1 align="center">react-native-gradient-mask</h1>
</p>

<p align="center">
  <b>React Native 原生漸層遮罩元件</b>
</p>

<p align="center">
  輕鬆建立精美的淡出效果、列表遮罩與流暢的漸層過渡動畫，具備原生效能與 Reanimated 動畫支援。
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
  <a href="./README.md">English</a> •
  <a href="./README.ja.md">日本語</a>
</p>

---

## 展示

<p align="center">
  <table>
    <tr>
      <td align="center"><b>iOS</b></td>
      <td align="center"><b>Android</b></td>
    </tr>
    <tr>
      <td><a href="./images/ios  Demo Video.webm"><img src="./images/ios.png" alt="iOS 展示" width="280" /></a></td>
      <td><a href="./images/android.mp4"><img src="./images/android.png" alt="Android 展示" width="280" /></a></td>
    </tr>
  </table>
</p>

## 特色

| 特色 | 說明 |
|------|------|
| **跨平台** | 支援 iOS、Android 和 Web |
| **原生效能** | iOS: `CAGradientLayer` • Android: `Bitmap` + `PorterDuff` • Web: CSS `mask-image` |
| **Reanimated 支援** | 透過 `AnimatedGradientMaskView` 實現 60fps 流暢遮罩動畫 |
| **彈性設定** | 自訂顏色、位置、方向與遮罩強度 |
| **TypeScript** | 完整型別定義 |

## 安裝

```bash
npm install react-native-gradient-mask
```

```bash
yarn add react-native-gradient-mask
```

### 需求

| 相依套件 | 版本 |
|----------|------|
| Expo SDK | 50+ |
| React Native | 0.73+ |
| react-native-reanimated | >= 3.0.0 *（選用）* |

### 設定

<details>
<summary><b>iOS</b></summary>

```bash
cd ios && pod install
```
</details>

<details>
<summary><b>Android</b></summary>

無需額外設定，自動連結已啟用。
</details>

---

## 快速開始

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

## API 參考

### 元件

| 元件 | 說明 |
|------|------|
| `GradientMaskView` | 基礎漸層遮罩元件 |
| `AnimatedGradientMaskView` | 支援 Reanimated 動畫的漸層遮罩元件 |

### Props

#### GradientMaskView

| 屬性 | 型別 | 必填 | 預設值 | 說明 |
|------|------|:----:|--------|------|
| `colors` | `(number \| null)[]` | 是 | - | 漸層顏色（需使用 `processColor()`） |
| `locations` | `number[]` | 是 | - | 顏色位置 (0-1) |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | 否 | `'top'` | 漸層方向 |
| `maskOpacity` | `number` | 否 | `1` | 遮罩強度 (0-1) |
| `style` | `ViewStyle` | 否 | - | 容器樣式 |
| `children` | `ReactNode` | 否 | - | 要套用遮罩的內容 |

#### AnimatedGradientMaskView

與 `GradientMaskView` 相同，但 `maskOpacity` 接受 `SharedValue<number>` 用於動畫控制。

### 方向說明

| 方向 | 效果 |
|------|------|
| `top` | 頂部透明 → 底部不透明 |
| `bottom` | 底部透明 → 頂部不透明 |
| `left` | 左側透明 → 右側不透明 |
| `right` | 右側透明 → 左側不透明 |

---

## 範例

### 基本淡出效果

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
        <Text>套用淡出效果的內容</Text>
      </ScrollView>
    </GradientMaskView>
  );
}
```

### 搭配 Reanimated 動畫

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

### 聊天列表動態遮罩

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

## 技巧與最佳實踐

### 務必使用 `processColor()`

```tsx
// ✅ 正確
const colors = [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
];

// ❌ 錯誤 - 無法運作
const colors = [
  'rgba(0,0,0,0)',
  'rgba(0,0,0,1)',
];
```

### 使用 `useMemo` 優化效能

```tsx
const maskColors = useMemo(() => [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
], []);
```

### 避免閃爍

```tsx
import { cancelAnimation } from 'react-native-reanimated';

// 在開始新動畫前取消前一個動畫
cancelAnimation(maskOpacity);
maskOpacity.value = withTiming(newValue, { duration: 300 });
```

---

## 平台支援

| 平台 | 實作方式 | 狀態 |
|------|----------|:----:|
| iOS | `CAGradientLayer` | ✅ |
| Android | `Bitmap` + `LinearGradient` + `PorterDuff` | ✅ |
| Web | CSS `mask-image` + `linear-gradient` | ✅ |

---

## 為 Anini 打造

這個套件最初是為 [**Anini**](https://play.google.com/store/apps/details?id=com.gazai.aichat) 開發的 — 一款提供流暢、原生品質使用者體驗的 AI 聊天夥伴應用程式。

<p align="center">
  <a href="https://play.google.com/store/apps/details?id=com.gazai.aichat">
    <img src="https://img.shields.io/badge/Google_Play-Anini-414141?style=for-the-badge&logo=google-play&logoColor=white" alt="在 Google Play 下載 Anini" />
  </a>
</p>

---

## 贊助

本專案由 [**GAZAI**](https://gazai.io/EN/services) 贊助 — 打造創新的 AI 驅動應用程式。

<p align="center">
  <a href="https://github.com/sponsors/CS6">
    <img src="https://img.shields.io/badge/贊助-GitHub_Sponsors-ea4aaa?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="在 GitHub 贊助" />
  </a>
</p>

---

## 授權

MIT © [DaYuan Lin (CS6)](https://github.com/CS6)

---

<p align="center">
  <sub>為 React Native 社群用心打造 ❤️</sub>
</p>
