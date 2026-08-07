// ============================================================
// Course Schema — Zod Runtime Validation
// ============================================================
// Validates JSON course files at load time. Catches malformed
// data before it reaches the rendering engine.
// ============================================================

import { z } from 'zod';

// --- Individual Stage Schemas ---

const ConceptStageSchema = z.object({
  type: z.literal('concept'),
  content: z.object({
    title: z.string().optional(),
    explanation: z.string(),
    example: z.string().optional(),
    beforeAfter: z.object({
      before: z.string(),
      after: z.string(),
    }).optional(),
    vs_comparison: z.object({
      left: z.object({ title: z.string(), points: z.array(z.string()) }),
      right: z.object({ title: z.string(), points: z.array(z.string()) }),
    }).optional(),
    tip: z.string().optional(),
    warning: z.string().optional(),
    typing_snippet: z.object({
      language: z.string(),
      code_to_type: z.string()
    }).optional(),
    blocks: z.array(z.any()).optional(),
  }),
});

const MCQQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explanation: z.string().optional(),
});

const MCQStageSchema = z.object({
  type: z.literal('mcq'),
  questions: z.array(MCQQuestionSchema).min(1),
});

const CodeStageSchema = z.object({
  type: z.literal('code'),
  challenge: z.object({
    question: z.string(),
    starterCode: z.string(),
    solution: z.string(),
    language: z.string().optional(),
    hint: z.string().optional(),
    explanation: z.string().optional(),
  }),
});

const FillBlankItemSchema = z.object({
  text: z.string(),
  answer: z.string(),
  hint: z.string().optional(),
});

const FillBlankStageSchema = z.object({
  type: z.literal('fill_blank'),
  sentences: z.array(FillBlankItemSchema).optional(),
  challenge: z.object({
    title: z.string(),
    question: z.string(),
    template: z.array(z.string()),
    options: z.array(z.string()).optional(),
    answers: z.record(z.string(), z.string()),
    explanation: z.string().optional(),
    hint: z.string().optional(),
  }).optional(),
});

const FlashcardStageSchema = z.object({
  type: z.literal('flashcard'),
  cards: z.array(z.object({
    front: z.string(),
    back: z.string(),
  })).min(1),
});

const SocraticStageSchema = z.object({
  type: z.literal('socratic'),
  topic: z.string().optional(),
  seedQuestion: z.string().optional(),
  guidingQuestions: z.array(z.string()).optional(),
  expectedInsight: z.string().optional(),
});

const RecallStageSchema = z.object({
  type: z.literal('recall'),
  prompt: z.string().optional(),
  expectedKeywords: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  timeLimit: z.number().optional(),
});

const ReflectionStageSchema = z.object({
  type: z.literal('reflection'),
  prompt: z.string().optional(),
  minWords: z.number().optional(),
  guidingPoints: z.array(z.string()).optional(),
});

const ScenarioStageSchema = z.object({
  type: z.literal('scenario'),
  title: z.string().optional(),
  description: z.string().optional(),
  choices: z.array(z.object({
    text: z.string(),
    outcome: z.string(),
    score: z.number(),
  })).optional(),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    choices: z.array(z.object({
      text: z.string(),
      outcome: z.string(),
      score: z.number(),
    })).optional(),
  }).optional(),
});

const CaseStudyStageSchema = z.object({
  type: z.literal('case_study'),
  title: z.string().optional(),
  context: z.string().optional(),
  questions: z.array(z.object({
    question: z.string(),
    expectedAnswer: z.string().optional(),
  })).optional(),
});

const InteractiveSimulationStageSchema = z.object({
  type: z.literal('interactive_simulation'),
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    label: z.string(),
    action: z.string(),
    description: z.string().optional(),
  })).optional(),
  goalDescription: z.string().optional(),
});

const DragDropStageSchema = z.object({
  type: z.literal('drag_drop'),
  instruction: z.string().optional(),
  items: z.array(z.string()).optional(),
  correctOrder: z.array(z.string()).optional(),
  categories: z.array(z.object({
    name: z.string(),
    correctItems: z.array(z.string()),
  })).optional(),
  content: z.object({
    question: z.string().optional(),
    buckets: z.array(z.object({
      name: z.string(),
      accepts: z.array(z.string()),
    })),
  }).optional(),
});

const SpeedQuizStageSchema = z.object({
  type: z.literal('speed_quiz'),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.number(),
  })).optional(),
  timePerQuestion: z.number().optional(),
});

const ProjectStageSchema = z.object({
  type: z.literal('project'),
  project: z.object({
    title: z.string(),
    description: z.string(),
    requirements: z.array(z.string()),
    starterCode: z.string().optional(),
  }),
});

const SystemDesignStageSchema = z.object({
  type: z.literal('system_design'),
  title: z.string().optional(),
  scenario: z.string().optional(),
  components: z.array(z.string()).optional(),
  expectedConnections: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })).optional(),
  hint: z.string().optional(),
});

const AIConversationStageSchema = z.object({
  type: z.literal('ai_conversation'),
  topic: z.string().optional(),
  systemPrompt: z.string().optional(),
  context: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  minTurns: z.number().optional(),
});

const AIFeedbackStageSchema = z.object({
  type: z.literal('ai_feedback'),
  prompt: z.string().optional(),
  rubric: z.object({
    clarity: z.number().optional(),
    correctness: z.number().optional(),
    improvement: z.string().optional(),
  }).optional(),
  expectedAnswer: z.string().optional(),
});

const AIEvaluatorStageSchema = z.object({
  type: z.literal('ai_evaluator'),
  prompt: z.string().optional(),
  expectedAnswer: z.string().optional(),
  scoringCriteria: z.array(z.string()).optional(),
});

const DebugAIStageSchema = z.object({
  type: z.literal('debug_ai'),
  brokenOutput: z.string().optional(),
  correctOutput: z.string().optional(),
  context: z.string().optional(),
  hint: z.string().optional(),
});

const PromptBuilderStageSchema = z.object({
  type: z.literal('prompt_builder'),
  objective: z.string().optional(),
  components: z.array(z.string()).optional(),
  exampleOutput: z.string().optional(),
  evaluationCriteria: z.array(z.string()).optional(),
});

const VisualStageSchema = z.object({
  type: z.literal('visual'),
  content: z.object({
    title: z.string(),
    diagram: z.array(z.string()).optional(),
    image: z.string().optional(),
    explanation: z.string().optional(),
  }),
});

const TeacherVisStageSchema = z.object({
  type: z.literal('teacher_vis'),
  content: z.object({
    title: z.string(),
    sections: z.array(z.object({
      label: z.string(),
      text: z.string().optional(),
      code: z.string().optional(),
    })),
  }),
});

const BoardVideoStageSchema = z.object({
  type: z.literal('board_video'),
  content: z.object({
    title: z.string(),
    voice: z.boolean().optional(),
    sections: z.array(z.object({
      label: z.string(),
      lines: z.array(z.string()),
    })),
  }),
});

const ReorderStageSchema = z.object({
  type: z.literal('reorder'),
  challenge: z.object({
    instruction: z.string(),
    correctOrder: z.array(z.string()),
  }),
});

const AIDiscussionStageSchema = z.object({
  type: z.literal('ai_discussion'),
  topic: z.object({
    prompt: z.string(),
    context: z.string(),
    objectives: z.array(z.string()),
  }),
});

const TypingPracticeStageSchema = z.object({
  type: z.literal('typing_practice'),
  content: z.object({
    title: z.string().optional(),
    explanation: z.string().optional(),
    language: z.string(),
    code_to_type: z.string(),
  }),
});

// --- Unified Stage Schema ---

export const StageSchema = z.discriminatedUnion('type', [
  ConceptStageSchema,
  MCQStageSchema,
  CodeStageSchema,
  FillBlankStageSchema,
  FlashcardStageSchema,
  SocraticStageSchema,
  RecallStageSchema,
  ReflectionStageSchema,
  ScenarioStageSchema,
  CaseStudyStageSchema,
  InteractiveSimulationStageSchema,
  DragDropStageSchema,
  SpeedQuizStageSchema,
  ProjectStageSchema,
  SystemDesignStageSchema,
  AIConversationStageSchema,
  AIFeedbackStageSchema,
  AIEvaluatorStageSchema,
  DebugAIStageSchema,
  PromptBuilderStageSchema,
  VisualStageSchema,
  TeacherVisStageSchema,
  BoardVideoStageSchema,
  ReorderStageSchema,
  AIDiscussionStageSchema,
  TypingPracticeStageSchema,
]);

// --- Lesson Schema ---

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  stages: z.array(StageSchema).min(1),
});

// --- Course Schema ---

export const CourseSchema = z.object({
  version: z.string().optional().default('3.0'),
  courseId: z.string().min(1),
  title: z.string().min(1),
  theme: z.object({
    primary: z.string(),
    accent: z.string(),
  }),
  lessons: z.array(LessonSchema).min(1),
});

// --- Validation Functions ---

export interface ValidationResult {
  success: boolean;
  data?: z.infer<typeof CourseSchema>;
  errors?: z.ZodError;
}

export function validateCourse(data: unknown): ValidationResult {
  const result = CourseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateLesson(data: unknown) {
  return LessonSchema.safeParse(data);
}

export function validateStage(data: unknown) {
  return StageSchema.safeParse(data);
}

// --- Backward Compatibility ---
// If a course JSON doesn't have a version field, we treat it as v3.0
// and apply any necessary transformations.

export function migrateIfNeeded(raw: Record<string, unknown>): Record<string, unknown> {
  const version = (raw.version as string) || '3.0';

  // v3.0 → v4.0 migration: no-op currently, but structure is here
  if (version === '3.0') {
    return { ...raw, version: '4.0' };
  }

  return raw;
}
