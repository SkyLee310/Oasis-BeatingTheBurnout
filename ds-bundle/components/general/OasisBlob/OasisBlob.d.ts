import * as React from 'react';

/**
 * OasisBlob — from .@1.0.0.
 */
export interface OasisBlobProps {
  /** Drives fill colour and expression. */
  zone: "green" | "amber" | "red";
  /** Square size in px. */
  size?: number;
  /** Set false to hold the blob still (in dense rows, or beside motion). */
  float?: boolean;
}

export declare const OasisBlob: React.ComponentType<OasisBlobProps>;
