CircularGauge from .. Use via `window.OasisDS.CircularGauge` (bundle loaded from the root `_ds_bundle.js`).

The hero ring gauge: a conic sweep, an ink-stroked disc, and a zone chip.

## Props

```ts
interface CircularGaugeProps {
  /** Current reading. */
  value: number;
  /** Full-sweep value. Defaults to 100. */
  max?: number;
  /** Drives the sweep colour and the chip underneath. */
  zone: "green" | "amber" | "red";
  /** The big number in the middle. */
  label: string;
  /** The small caption under it. */
  sublabel: string;
  /** Outer diameter in px. Inner disc and type scale with it. */
  size?: number;
}
```
