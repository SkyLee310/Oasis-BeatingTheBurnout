import type { ZoneKey } from './tokens';
export interface OasisBlobProps {
    /** Drives fill colour and expression. */
    zone: ZoneKey;
    /** Square size in px. */
    size?: number;
    /** Set false to hold the blob still (in dense rows, or beside motion). */
    float?: boolean;
    /** Override the body fill. Leave unset almost everywhere: the zone owns this
     *  colour, and reporting the zone is the mascot's entire job. Pass one only
     *  where the blob is a logo mark rather than a readout. */
    fillColor?: string;
    /** Override every outline — body, cheeks, mouth. Defaults to the ink token. */
    strokeColor?: string;
    /** Catchlight in each eye. */
    eyeHighlightFill?: string;
    /** Fill enclosed by the mouth curve. `none` keeps the mouth a bare line. */
    mouthFill?: string;
    /** Mouth stroke. Defaults to the body outline colour. */
    mouthStroke?: string;
    /** End shape of the mouth stroke. */
    mouthLinecap?: 'round' | 'butt' | 'square';
    /** End shape of the body outline. */
    strokeLinecap?: 'round' | 'butt' | 'square';
    /** Lift the blob off its surface with the house offset shadow. */
    shadow?: boolean;
}
/**
 * The Oasis mascot. A single blob whose expression is bound to the current
 * zone. Purely decorative — it reports state, it does not collect it.
 */
export declare function OasisBlob({ zone, size, float, fillColor, strokeColor, eyeHighlightFill, mouthFill, mouthStroke, mouthLinecap, strokeLinecap, shadow, }: OasisBlobProps): import("react").JSX.Element;
//# sourceMappingURL=OasisBlob.d.ts.map