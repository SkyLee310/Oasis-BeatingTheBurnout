import * as React from 'react';

/**
 * StatTile — from .@1.0.0.
 */
export interface StatTileProps {
  /** Pastel fill. Pick by meaning, not by rotation. */
  variant: "mint" | "sky" | "blush" | "butter" | "lilac";
  /** A lucide icon at strokeWidth={SW}. */
  icon: React.ReactNode;
  /** Eyebrow text beside the icon. */
  label: string;
  /** The headline figure. */
  value: string;
  /** Unit suffix rendered next to the figure. */
  unit?: string;
  /** Short caption pinned to the top-right. */
  note?: string;
  /** Anything that belongs under the figure — a Sparkline, a bar, prose. */
  children?: React.ReactNode;
  /** When set, pins a ZoneChip to the bottom of the tile. */
  zone?: "green" | "amber" | "red";
}

export declare const StatTile: React.ComponentType<StatTileProps>;
