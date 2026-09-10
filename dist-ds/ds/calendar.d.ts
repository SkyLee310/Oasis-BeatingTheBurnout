export type EventKind = 'deadline' | 'class' | 'commitment' | 'rest' | 'alert';
export interface CalEvent {
    time: string;
    title: string;
    kind: EventKind;
    energy?: number;
}
export interface CalDay {
    date: number;
    day: string;
    month: string;
    isToday?: boolean;
    events: CalEvent[];
}
export declare const KIND_STYLE: Record<EventKind, {
    bg: string;
    text: string;
    dot: string;
}>;
export declare const CALENDAR_WEEK: CalDay[];
//# sourceMappingURL=calendar.d.ts.map