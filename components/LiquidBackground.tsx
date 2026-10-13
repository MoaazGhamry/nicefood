'use client';

import React from 'react';

export default function LiquidBackground() {
  return (
    <div
      className="liquid-bg-container"
      aria-hidden="true"
    >
      {/* Dynamic Multi-Brand Live Aurora Mesh */}
      <div className="liquid-aurora-mesh" />

      {/* Floating Fluid Brand Orbs */}
      <div className="liquid-brand-orb liquid-brand-orb--nicefood" />
      <div className="liquid-brand-orb liquid-brand-orb--tamoush" />
      <div className="liquid-brand-orb liquid-brand-orb--ibn" />
      <div className="liquid-brand-orb liquid-brand-orb--mazaya" />
      <div className="liquid-brand-orb liquid-brand-orb--gold" />

      {/* Glass Frost Shimmer Overlay */}
      <div className="liquid-glass-frost" />
    </div>
  );
}
