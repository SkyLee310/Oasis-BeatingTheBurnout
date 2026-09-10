import * as React from 'react';

/**
 * Sparkline — from .@1.0.0.
 */
export interface SparklineProps {
  /** Series to plot. Rendered left to right; the last bar reads as "now". */
  values: number[];
  /** Bar colour. */
  zone?: "green" | "amber" | "red";
  /** Overall height in px. */
  height?: number;
}

export declare const Sparkline: React.ComponentType<SparklineProps>;
