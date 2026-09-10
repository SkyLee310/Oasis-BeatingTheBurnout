export interface InitialsProps {
    /** Diameter in px. Type scales with it. */
    size?: number;
    /** One or two letters. When omitted or set to 'MC', renders the default avatar picture. */
    initials?: string;
    /** Explicit avatar image URL. Set to null to force text initials. */
    src?: string | null;
    /** Alt text for image */
    alt?: string;
    /** Disc colour behind the initials, and the backdrop while a photo loads.
     *  A token, never a literal — this sits under text at small sizes. */
    bg?: string;
}
/**
 * Avatar component: renders the user's avatar image by default,
 * or a colored disc with initials when specific initials are provided.
 */
export declare function Initials({ size, initials, src, alt, bg }: InitialsProps): import("react").JSX.Element;
//# sourceMappingURL=Initials.d.ts.map