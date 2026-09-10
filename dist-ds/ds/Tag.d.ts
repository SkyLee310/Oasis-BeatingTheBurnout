import type { ReactNode } from 'react';
export interface TagProps {
    children: ReactNode;
    /** Fill colour. `neutral` is the plain surface pill. */
    tone?: 'neutral' | 'yellow' | 'green' | 'amber' | 'red';
}
/** A small stroked pill for metadata — dates, counts, short labels. */
export declare function Tag({ children, tone }: TagProps): import("react").JSX.Element;
//# sourceMappingURL=Tag.d.ts.map