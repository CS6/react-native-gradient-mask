import { requireNativeView } from 'expo';
import * as React from 'react';

import { GradientMaskViewProps } from './GradientMask.types';

const NativeView: React.ComponentType<GradientMaskViewProps> =
  requireNativeView('GradientMask');

export default function GradientMaskView(props: GradientMaskViewProps) {
  return <NativeView {...props} />;
}
