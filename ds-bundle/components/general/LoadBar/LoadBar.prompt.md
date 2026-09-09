LoadBar from .. Use via `window.OasisDS.LoadBar` (bundle loaded from the root `_ds_bundle.js`).

A labelled capacity bar with its percentage and zone called out above it.

## Props

```ts
interface LoadBarProps {
  /** What is being measured. */
  label: string;
  /** Fill percentage, 0-100. */
  pct: number;
  /** Drives the fill colour and the trailing chip. */
  zone: "green" | "amber" | "red";
}
```
