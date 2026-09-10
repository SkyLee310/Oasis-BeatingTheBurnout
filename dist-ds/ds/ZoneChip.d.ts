import { type ZoneKey } from './tokens';
export interface ZoneChipProps {
    /** Which health zone to announce. */
    zone: ZoneKey;
    /** `lg` is for hero surfaces; `sm` is the default inline size. */
    size?: 'sm' | 'lg';
}
/** The canonical status pill. Never write a zone label by hand — use this. */
export declare function ZoneChip({ zone, size }: ZoneChipProps): import("react").JSX.Element;
//# sourceMappingURL=ZoneChip.d.ts.map