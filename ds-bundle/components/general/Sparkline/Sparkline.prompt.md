Sparkline from .. Use via `window.OasisDS.Sparkline` (bundle loaded from the root `_ds_bundle.js`).

A compact trend strip. Thin bars are stroked by their container rather than
individually — at this width per-bar strokes collapse into noise.

## Props

```ts
interface SparklineProps {
  /** Series to plot. Rendered left to right; the last bar reads as "now". */
  values: number[];
  /** Bar colour. */
  zone?: "green" | "amber" | "red";
  /** Overall height in px. */
  height?: number;
}
```
