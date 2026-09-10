import * as React from 'react';

/**
 * ZoneChip — from .@1.0.0.
 */
export interface ZoneChipProps {
  /** Which health zone to announce. */
  zone: "green" | "amber" | "red";
  /** `lg` is for hero surfaces; `sm` is the default inline size. */
  size?: "sm" | "lg";
}

export declare const ZoneChip: React.ComponentType<ZoneChipProps>;
