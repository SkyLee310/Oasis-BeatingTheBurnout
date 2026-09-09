import { type ZoneKey } from './tokens';
export interface SparklineProps {
    /** Series to plot. Rendered left to right; the last bar reads as "now". */
    values: number[];
    /** Bar colour. */
    zone?: ZoneKey;
    /** Overall height in px. */
    height?: number;
}
/**
 * A compact trend strip. Thin bars are stroked by their container rather than
 * individually — at this width per-bar strokes collapse into noise.
 */
export declare function Sparkline({ values, zone, height }: SparklineProps): import("react").JSX.Element;
//# sourceMappingURL=Sparkline.d.ts.map