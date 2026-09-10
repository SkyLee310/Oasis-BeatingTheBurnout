import * as React from 'react';

/**
 * SleepBars — from .@1.0.0.
 */
export interface SleepBarsProps {
  data: SleepDatum[];
  /** Overall height in px. */
  height?: number;
}

export declare const SleepBars: React.ComponentType<SleepBarsProps>;
