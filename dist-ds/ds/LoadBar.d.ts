import { type ZoneKey } from './tokens';
export interface LoadBarProps {
    /** What is being measured. */
    label: string;
    /** Fill percentage, 0-100. */
    pct: number;
    /** Drives the fill colour and the trailing chip. */
    zone: ZoneKey;
}
/** A labelled capacity bar with its percentage and zone called out above it. */
export declare function LoadBar({ label, pct, zone }: LoadBarProps): import("react").JSX.Element;
//# sourceMappingURL=LoadBar.d.ts.map