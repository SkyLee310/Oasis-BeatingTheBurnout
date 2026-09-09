ZoneChip from .. Use via `window.OasisDS.ZoneChip` (bundle loaded from the root `_ds_bundle.js`).

The canonical status pill. Never write a zone label by hand — use this.

## Props

```ts
interface ZoneChipProps {
  /** Which health zone to announce. */
  zone: "green" | "amber" | "red";
  /** `lg` is for hero surfaces; `sm` is the default inline size. */
  size?: "sm" | "lg";
}
```
