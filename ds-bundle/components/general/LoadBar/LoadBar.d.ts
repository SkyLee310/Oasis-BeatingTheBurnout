import * as React from 'react';

/**
 * LoadBar — from .@1.0.0.
 */
export interface LoadBarProps {
  /** What is being measured. */
  label: string;
  /** Fill percentage, 0-100. */
  pct: number;
  /** Drives the fill colour and the trailing chip. */
  zone: "green" | "amber" | "red";
}

export declare const LoadBar: React.ComponentType<LoadBarProps>;
