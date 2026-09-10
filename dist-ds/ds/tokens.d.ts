/** The three health zones every status surface in Oasis is keyed to. */
export type ZoneKey = 'green' | 'amber' | 'red';
/**
 * Icon stroke width. Icons carry the same weight as the strokes around them —
 * 1.5px reads as a hairline next to a 2px card border and breaks the language.
 */
export declare const SW = 2.25;
export declare const ZONE_LABEL: Record<ZoneKey, string>;
/** The saturated accent for a zone — for fills, bars and gauge sweeps. */
export declare const zoneAccent: (zone: ZoneKey) => string;
/** The pastel tile class for a zone — for bento surfaces. */
export declare const zoneTile: (zone: ZoneKey) => "tile-mint" | "tile-butter" | "tile-blush";
//# sourceMappingURL=tokens.d.ts.map