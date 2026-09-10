import * as React from 'react';

/**
 * WeekCalendar — from .@1.0.0.
 */
export interface WeekCalendarProps {
  /** The date currently selected, or null for none. */
  selectedDate: number;
  /** Fired with the whole day object when a cell is pressed. */
  onDayClick: (day: CalDay) => void;
  /** The week to render. Defaults to the sample week in `calendar.ts`. */
  days?: CalDay[];
}

export declare const WeekCalendar: React.ComponentType<WeekCalendarProps>;
