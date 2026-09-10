import type { ZoneKey } from './tokens';
export interface OasisBlobProps {
    /** Drives fill colour and expression. */
    zone: ZoneKey;
    /** Square size in px. */
    size?: number;
    /** Set false to hold the blob still (in dense rows, or beside motion). */
    float?: boolean;
}
/**
 * The Oasis mascot. A single blob whose expression is bound to the current
 * zone. Purely decorative — it reports state, it does not collect it.
 */
export declare function OasisBlob({ zone, size, float }: OasisBlobProps): import("react").JSX.Element;
//# sourceMappingURL=OasisBlob.d.ts.map