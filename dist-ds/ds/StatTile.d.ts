import type { ReactNode } from 'react';
import type { ZoneKey } from './tokens';
export interface StatTileProps {
    /** Pastel fill. Pick by meaning, not by rotation. */
    variant: 'mint' | 'sky' | 'blush' | 'butter' | 'lilac';
    /** A lucide icon at strokeWidth={SW}. */
    icon: ReactNode;
    /** Eyebrow text beside the icon. */
    label: string;
    /** The headline figure. */
    value: string;
    /** Unit suffix rendered next to the figure. */
    unit?: string;
    /** Short caption pinned to the top-right. */
    note?: string;
    /** Anything that belongs under the figure — a Sparkline, a bar, prose. */
    children?: ReactNode;
    /** When set, pins a ZoneChip to the bottom of the tile. */
    zone?: ZoneKey;
}
/** The bento tile: one figure, one meaning, one optional sub-visual. */
export declare function StatTile({ variant, icon, label, value, unit, note, children, zone, }: StatTileProps): import("react").JSX.Element;
//# sourceMappingURL=StatTile.d.ts.map