// ============================================================
// Sidebar Types — Core Data Structures (Three-Level Schema)
// ============================================================

export interface RawLesson {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  slug: string;
  isLocked?: boolean;
  stages?: any[];
}

export interface RawTopic {
  topic_id: string;
  topic_title: string;
  module_id: string;
  description?: string;
  lesson_ids: string[];
}

export interface RawModule {
  module_id: string;
  module_title: string;
  description?: string;
  order: number;
  topic_ids: string[];
}

export interface RawTopicsSchema {
  modules: RawModule[];
  topics: RawTopic[];
}

export interface SidebarSlide {
  id: string;
  index: number;
  title: string;
  type?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface NewRawTopic {
  id: string;
  title: string;
  isPhase?: boolean;
  children?: NewRawTopic[];
}

export interface NewRawModule {
  id: string;
  title: string;
  topics: NewRawTopic[];
}

export interface SidebarTopic {
  id: string;
  title: string;
  moduleId: string;
  order?: number;
  isLocked: boolean;
  isCompleted: boolean;
  isActive: boolean;
  isVisited?: boolean;
  // Phase grouping (for M10-M20)
  isPhase?: boolean;
  children?: SidebarTopic[];
  // Slide-level data
  slides?: SidebarSlide[];
  completedSlidesCount?: number;
  totalSlidesCount?: number;
  // Stage index within parent lesson (for navigation)
  stageIndex?: number;
}

export interface SidebarModule {
  moduleId: string;
  moduleTitle: string;
  moduleDescription?: string;
  order: number;
  topics: SidebarTopic[];
  progress: number; // Completion percentage (0 to 100)
  isLocked: boolean;
  isExpanded: boolean;
}

export interface ValidationError {
  type: 'module' | 'topic' | 'lesson-reference';
  entityId: string;
  message: string;
}

export interface SidebarState {
  activeLessonId: string | null;
  expandedModules: Record<string, boolean>;
  completedLessons: string[];
  hoveredTopicId: string | null;
  loading: boolean;
  validationErrors: ValidationError[];
}
