"use client";

import NeuralNetworkBackground from "./NeuralNetworkBackground";

/**
 * Dynasty Background - Just the cool 3D holographic neural network effect
 * without the voice assistant functionality
 */
export default function DynastyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
      <NeuralNetworkBackground isActive={true} />
    </div>
  );
}
