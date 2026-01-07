<p align="center">
  <h1 align="center">react-native-gradient-mask</h1>
</p>

<p align="center">
  <b>React Native ネイティブグラデーションマスクコンポーネント</b>
</p>

<p align="center">
  美しいフェードエフェクト、リストマスク、スムーズなグラデーショントランジションを、ネイティブパフォーマンスと Reanimated アニメーションサポートで実現。
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
  <a href="./README.zh-TW.md">繁體中文</a>
</p>

---

## デモ

<p align="center">
  <table>
    <tr>
      <td align="center"><b>iOS</b></td>
      <td align="center"><b>Android</b></td>
    </tr>
    <tr>
      <td><a href="./images/ios  Demo Video.webm"><img src="./images/ios.png" alt="iOS デモ" width="280" /></a></td>
      <td><a href="./images/android.mp4"><img src="./images/android.png" alt="Android デモ" width="280" /></a></td>
    </tr>
  </table>
</p>

## 特徴

| 特徴 | 説明 |
|------|------|
| **クロスプラットフォーム** | iOS、Android、Web 対応 |
| **ネイティブパフォーマンス** | iOS: `CAGradientLayer` • Android: `Bitmap` + `PorterDuff` • Web: CSS `mask-image` |
| **Reanimated 対応** | `AnimatedGradientMaskView` で 60fps のスムーズなマスクアニメーション |
| **柔軟な設定** | カスタムカラー、位置、方向、マスク強度 |
| **TypeScript** | 完全な型定義付き |

## インストール

```bash
npm install react-native-gradient-mask
```

```bash
yarn add react-native-gradient-mask
```

### 必要条件

| 依存関係 | バージョン |
|----------|-----------|
| Expo SDK | 50+ |
| React Native | 0.73+ |
| react-native-reanimated | >= 3.0.0 *（オプション）* |

### セットアップ

<details>
<summary><b>iOS</b></summary>

```bash
cd ios && pod install
```
</details>

<details>
<summary><b>Android</b></summary>

追加設定不要。オートリンクが有効です。
</details>

---

## クイックスタート

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

## API リファレンス

### コンポーネント

| コンポーネント | 説明 |
|----------------|------|
| `GradientMaskView` | 基本グラデーションマスクコンポーネント |
| `AnimatedGradientMaskView` | Reanimated アニメーション対応グラデーションマスク |

### Props

#### GradientMaskView

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|------------|------|:----:|------------|------|
| `colors` | `(number \| null)[]` | はい | - | グラデーションカラー（`processColor()` を使用） |
| `locations` | `number[]` | はい | - | カラー位置 (0-1) |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | いいえ | `'top'` | グラデーション方向 |
| `maskOpacity` | `number` | いいえ | `1` | マスク強度 (0-1) |
| `style` | `ViewStyle` | いいえ | - | コンテナスタイル |
| `children` | `ReactNode` | いいえ | - | マスクを適用するコンテンツ |

#### AnimatedGradientMaskView

`GradientMaskView` と同じですが、`maskOpacity` はアニメーション制御用の `SharedValue<number>` を受け付けます。

### 方向ガイド

| 方向 | 効果 |
|------|------|
| `top` | 上部が透明 → 下部が不透明 |
| `bottom` | 下部が透明 → 上部が不透明 |
| `left` | 左側が透明 → 右側が不透明 |
| `right` | 右側が透明 → 左側が不透明 |

---

## 使用例

### 基本的なフェードエフェクト

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
        <Text>フェードエフェクト付きコンテンツ</Text>
      </ScrollView>
    </GradientMaskView>
  );
}
```

### Reanimated アニメーションとの連携

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

### チャットリストの動的マスク

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

## ヒントとベストプラクティス

### 必ず `processColor()` を使用

```tsx
// ✅ 正しい
const colors = [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
];

// ❌ 間違い - 動作しません
const colors = [
  'rgba(0,0,0,0)',
  'rgba(0,0,0,1)',
];
```

### `useMemo` で最適化

```tsx
const maskColors = useMemo(() => [
  processColor('rgba(0,0,0,0)'),
  processColor('rgba(0,0,0,1)'),
], []);
```

### ちらつきを防ぐ

```tsx
import { cancelAnimation } from 'react-native-reanimated';

// 新しいアニメーションを開始する前に前のアニメーションをキャンセル
cancelAnimation(maskOpacity);
maskOpacity.value = withTiming(newValue, { duration: 300 });
```

---

## プラットフォームサポート

| プラットフォーム | 実装 | 状態 |
|------------------|------|:----:|
| iOS | `CAGradientLayer` | ✅ |
| Android | `Bitmap` + `LinearGradient` + `PorterDuff` | ✅ |
| Web | CSS `mask-image` + `linear-gradient` | ✅ |

---

## ライセンス

MIT © [DaYuan Lin (CS6)](https://github.com/CS6)

---

<p align="center">
  <sub>React Native コミュニティのために ❤️ を込めて作りました</sub>
</p>
