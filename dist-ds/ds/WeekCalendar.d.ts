import { type CalDay } from './calendar';
export interface WeekCalendarProps {
    /** The date currently selected, or null for none. */
    selectedDate: number | null;
    /** Fired with the whole day object when a cell is pressed. */
    onDayClick: (day: CalDay) => void;
    /** The week to render. Defaults to the sample week in `calendar.ts`. */
    days?: CalDay[];
}
/** A seven-cell week scrubber. Selection floods yellow; today reads sky blue. */
export declare function WeekCalendar({ selectedDate, onDayClick, days, }: WeekCalendarProps): import("react").JSX.Element;
//# sourceMappingURL=WeekCalendar.d.ts.map