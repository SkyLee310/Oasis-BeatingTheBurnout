import type { ReactNode } from 'react';
export interface TagProps {
    children: ReactNode;
    /** Fill colour. `neutral` is the plain surface pill. */
    tone?: 'neutral' | 'yellow' | 'green' | 'amber' | 'red';
    /** Softer fill than the tone's default, for a pill that should sit back
     *  rather than shout. Text colour still follows `tone`, so the pair stays
     *  legible — pass a token, never a literal. */
    bg?: string;
}
/** A small stroked pill for metadata — dates, counts, short labels. */
export declare function Tag({ children, tone, bg: bgOverride }: TagProps): import("react").JSX.Element;
//# sourceMappingURL=Tag.d.ts.map