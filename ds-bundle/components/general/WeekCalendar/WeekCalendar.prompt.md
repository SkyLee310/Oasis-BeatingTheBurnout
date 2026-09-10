WeekCalendar from .. Use via `window.OasisDS.WeekCalendar` (bundle loaded from the root `_ds_bundle.js`).

A seven-cell week scrubber. Selection floods yellow; today reads sky blue.

## Props

```ts
interface WeekCalendarProps {
  /** The date currently selected, or null for none. */
  selectedDate: number;
  /** Fired with the whole day object when a cell is pressed. */
  onDayClick: (day: CalDay) => void;
  /** The week to render. Defaults to the sample week in `calendar.ts`. */
  days?: CalDay[];
}
```
