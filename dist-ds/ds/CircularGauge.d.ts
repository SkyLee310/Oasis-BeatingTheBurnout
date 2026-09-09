import { type ZoneKey } from './tokens';
export interface CircularGaugeProps {
    /** Current reading. */
    value: number;
    /** Full-sweep value. Defaults to 100. */
    max?: number;
    /** Drives the sweep colour and the chip underneath. */
    zone: ZoneKey;
    /** The big number in the middle. */
    label: string;
    /** The small caption under it. */
    sublabel: string;
    /** Outer diameter in px. Inner disc and type scale with it. */
    size?: number;
}
/** The hero ring gauge: a conic sweep, an ink-stroked disc, and a zone chip. */
export declare function CircularGauge({ value, max, zone, label, sublabel, size, }: CircularGaugeProps): import("react").JSX.Element;
//# sourceMappingURL=CircularGauge.d.ts.map