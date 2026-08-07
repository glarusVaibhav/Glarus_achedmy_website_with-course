import React from 'react';
import { RendererKey } from './rendererSelector';
import { StandardRenderer } from './renderers/StandardRenderer';
import { CodeConceptRenderer } from './renderers/CodeConceptRenderer';
import { ComparisonRenderer } from './renderers/ComparisonRenderer';
import { SevenPointRenderer } from './renderers/SevenPointRenderer';

// We map the string keys to actual imported React components.
export const RendererRegistry: Record<RendererKey, React.ComponentType<any>> = {
  standard: StandardRenderer,
  code: CodeConceptRenderer,
  comparison: ComparisonRenderer,
  spatial: StandardRenderer, // Fallback for spatial until we build it
  'seven-point': SevenPointRenderer,
};
