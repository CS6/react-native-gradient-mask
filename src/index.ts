// Reexport the native module. On web, it will be resolved to GradientMaskModule.web.ts
// and on native platforms to GradientMaskModule.ts
export { default } from './GradientMaskModule';
export { default as GradientMaskView } from './GradientMaskView';
export { default as AnimatedGradientMaskView } from './AnimatedGradientMaskView';
export type { AnimatedGradientMaskViewProps } from './AnimatedGradientMaskView';
export * from './GradientMask.types';
