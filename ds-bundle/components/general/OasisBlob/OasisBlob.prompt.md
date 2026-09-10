OasisBlob from .. Use via `window.OasisDS.OasisBlob` (bundle loaded from the root `_ds_bundle.js`).

The Oasis mascot. A single blob whose expression is bound to the current
zone. Purely decorative — it reports state, it does not collect it.

## Props

```ts
interface OasisBlobProps {
  /** Drives fill colour and expression. */
  zone: "green" | "amber" | "red";
  /** Square size in px. */
  size?: number;
  /** Set false to hold the blob still (in dense rows, or beside motion). */
  float?: boolean;
}
```
