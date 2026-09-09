import * as React from 'react';

/**
 * CircularGauge — from .@1.0.0.
 */
export interface CircularGaugeProps {
  /** Current reading. */
  value: number;
  /** Full-sweep value. Defaults to 100. */
  max?: number;
  /** Drives the sweep colour and the chip underneath. */
  zone: "green" | "amber" | "red";
  /** The big number in the middle. */
  label: string;
  /** The small caption under it. */
  sublabel: string;
  /** Outer diameter in px. Inner disc and type scale with it. */
  size?: number;
}

export declare const CircularGauge: React.ComponentType<CircularGaugeProps>;
