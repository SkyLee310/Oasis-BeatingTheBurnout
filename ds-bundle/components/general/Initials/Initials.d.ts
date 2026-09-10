import * as React from 'react';

/**
 * Initials — from .@1.0.0.
 */
export interface InitialsProps {
  /** Diameter in px. Type scales with it. */
  size?: number;
  /** One or two letters. */
  initials?: string;
}

export declare const Initials: React.ComponentType<InitialsProps>;
