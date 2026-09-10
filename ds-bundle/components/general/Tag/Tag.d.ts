import * as React from 'react';

/**
 * Tag — from .@1.0.0.
 */
export interface TagProps {
  children: React.ReactNode;
  /** Fill colour. `neutral` is the plain surface pill. */
  tone?: "green" | "amber" | "red" | "neutral" | "yellow";
}

export declare const Tag: React.ComponentType<TagProps>;
