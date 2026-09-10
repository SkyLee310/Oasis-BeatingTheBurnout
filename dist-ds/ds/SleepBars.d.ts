export interface SleepDatum {
    /** Short day label shown under the bar. */
    day: string;
    /** Hours slept. Zone thresholds: >=7 green, >=6 amber, else red. */
    hours: number;
    /** Marks the current day — heavier stroke, hard shadow, bolder label. */
    isToday?: boolean;
}
export interface SleepBarsProps {
    data: SleepDatum[];
    /** Overall height in px. */
    height?: number;
}
/** A week of sleep, each night in its own stroked track. */
export declare function SleepBars({ data, height }: SleepBarsProps): import("react").JSX.Element;
//# sourceMappingURL=SleepBars.d.ts.map