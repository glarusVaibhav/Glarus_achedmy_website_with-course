"use client";

import type { StageComponentProps, ConceptStageData } from '@/types/engine';
import { AdaptiveConceptStage } from './concept/AdaptiveConceptStage';

export function ConceptStage({ data, onComplete }: StageComponentProps<ConceptStageData>) {
  // Delegate entirely to the new Concept-Aware Adaptive Rendering Engine
  return <AdaptiveConceptStage data={data} onComplete={onComplete} />;
}
