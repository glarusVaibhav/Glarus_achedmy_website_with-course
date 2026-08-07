// ============================================================
// Stage Registry — Plugin System (V4)
// ============================================================
// Supports dynamic registration of stage components at runtime.
// External packages can call registerStage() to extend the OS.
// Lazy-loaded components via React.lazy for performance.
// ============================================================

import { lazy, type ComponentType } from 'react';
import type { StageComponentProps, StageJSON } from '@/types/engine';

// --- Plugin Metadata ---

export interface StagePluginMeta {
  displayName?: string;
  category?: 'core' | 'advanced' | 'ai' | 'visual' | 'external';
  description?: string;
  version?: string;
}

export interface StagePlugin {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<StageComponentProps<any>>;
  meta?: StagePluginMeta;
}

// --- Registry ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STAGE_COMPONENTS = new Map<string, ComponentType<StageComponentProps<any>>>();
const STAGE_META = new Map<string, StagePluginMeta>();

// --- Core Stage Registrations (Lazy Loaded) ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const coreMappings: Array<{ type: string; loader: () => Promise<{ [key: string]: ComponentType<StageComponentProps<any>> }>; exportName: string; category: StagePluginMeta['category'] }> = [
  { type: 'concept', loader: () => import('@/components/stages/ConceptStage'), exportName: 'ConceptStage', category: 'core' },
  { type: 'mcq', loader: () => import('@/components/stages/MCQStage'), exportName: 'MCQStage', category: 'core' },
  { type: 'code', loader: () => import('@/components/stages/CodeStage'), exportName: 'CodeStage', category: 'core' },
  { type: 'fill_blank', loader: () => import('@/components/stages/FillBlankStage'), exportName: 'FillBlankStage', category: 'core' },
  { type: 'flashcard', loader: () => import('@/components/stages/FlashcardStage'), exportName: 'FlashcardStage', category: 'core' },
  { type: 'reorder', loader: () => import('@/components/stages/ReorderStage'), exportName: 'ReorderStage', category: 'core' },
  { type: 'socratic', loader: () => import('@/components/stages/SocraticStage'), exportName: 'SocraticStage', category: 'advanced' },
  { type: 'recall', loader: () => import('@/components/stages/RecallStage'), exportName: 'RecallStage', category: 'advanced' },
  { type: 'reflection', loader: () => import('@/components/stages/ReflectionStage'), exportName: 'ReflectionStage', category: 'advanced' },
  { type: 'scenario', loader: () => import('@/components/stages/ScenarioStage'), exportName: 'ScenarioStage', category: 'advanced' },
  { type: 'case_study', loader: () => import('@/components/stages/CaseStudyStage'), exportName: 'CaseStudyStage', category: 'advanced' },
  { type: 'interactive_simulation', loader: () => import('@/components/stages/InteractiveSimulationStage'), exportName: 'InteractiveSimulationStage', category: 'advanced' },
  { type: 'drag_drop', loader: () => import('@/components/stages/DragDropStage'), exportName: 'DragDropStage', category: 'advanced' },
  { type: 'speed_quiz', loader: () => import('@/components/stages/SpeedQuizStage'), exportName: 'SpeedQuizStage', category: 'advanced' },
  { type: 'project', loader: () => import('@/components/stages/ProjectStage'), exportName: 'ProjectStage', category: 'advanced' },
  { type: 'system_design', loader: () => import('@/components/stages/SystemDesignStage'), exportName: 'SystemDesignStage', category: 'advanced' },
  { type: 'ai_conversation', loader: () => import('@/components/stages/AIConversationStage'), exportName: 'AIConversationStage', category: 'ai' },
  { type: 'ai_feedback', loader: () => import('@/components/stages/AIFeedbackStage'), exportName: 'AIFeedbackStage', category: 'ai' },
  { type: 'ai_evaluator', loader: () => import('@/components/stages/AIEvaluatorStage'), exportName: 'AIEvaluatorStage', category: 'ai' },
  { type: 'debug_ai', loader: () => import('@/components/stages/DebugAIStage'), exportName: 'DebugAIStage', category: 'ai' },
  { type: 'prompt_builder', loader: () => import('@/components/stages/PromptBuilderStage'), exportName: 'PromptBuilderStage', category: 'ai' },
  { type: 'visual', loader: () => import('@/components/stages/VisualStage'), exportName: 'VisualStage', category: 'visual' },
  { type: 'teacher_vis', loader: () => import('@/components/stages/TeacherVisStage'), exportName: 'TeacherVisStage', category: 'visual' },
  { type: 'board_video', loader: () => import('@/components/stages/BoardVideoStage'), exportName: 'BoardVideoStage', category: 'visual' },
];

// Register all core stages as lazy components
coreMappings.forEach(({ type, loader, exportName, category }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LazyComponent = lazy(() => loader().then((mod) => ({ default: (mod as any)[exportName] })));
  STAGE_COMPONENTS.set(type, LazyComponent);
  STAGE_META.set(type, { displayName: exportName, category, version: '4.0' });
});

// --- Public API ---

export function getStageComponent(type: string) {
  return STAGE_COMPONENTS.get(type) ?? null;
}

export function registerStage(plugin: StagePlugin): void {
  STAGE_COMPONENTS.set(plugin.type, plugin.component);
  if (plugin.meta) {
    STAGE_META.set(plugin.type, plugin.meta);
  }
}

export function unregisterStage(type: string): boolean {
  STAGE_META.delete(type);
  return STAGE_COMPONENTS.delete(type);
}

export function getRegisteredTypes(): string[] {
  return Array.from(STAGE_COMPONENTS.keys());
}

export function getStageMeta(type: string): StagePluginMeta | undefined {
  return STAGE_META.get(type);
}

export function getStagesByCategory(category: string): string[] {
  const result: string[] = [];
  STAGE_META.forEach((meta, type) => {
    if (meta?.category === category) result.push(type);
  });
  return result;
}

// Backward compat: export the map as a plain object
export const STAGE_COMPONENTS_MAP = Object.fromEntries(STAGE_COMPONENTS);
