// ============================================================
// Learning OS Engine — Core Type Definitions
// ============================================================

// --- JSON Schema Types (what the course file contains) ---

export interface CourseJSON {
  courseId: string;
  title: string;
  theme: {
    primary: string;
    accent: string;
  };
  lessons: LessonJSON[];
}

export interface LessonJSON {
  id: string;
  title: string;
  stages: StageJSON[];
}

// A stage is a polymorphic block. The `type` field dictates which
// React component renders it and which shape `content` takes.
export type StageJSON =
  | ConceptStageData
  | MCQStageData
  | CodeStageData
  | FillBlankStageData
  | FlashcardStageData
  | ReorderStageData
  | ProjectStageData
  | AIDiscussionStageData
  // --- Advanced Stage Types ---
  | SocraticStageData
  | RecallStageData
  | ReflectionStageData
  | ScenarioStageData
  | CaseStudyStageData
  | InteractiveSimulationStageData
  | DragDropStageData
  | SpeedQuizStageData
  | SystemDesignStageData
  | AIConversationStageData
  | AIFeedbackStageData
  | AIEvaluatorStageData
  | DebugAIStageData
  | PromptBuilderStageData
  | VisualStageData
  | TeacherVisStageData
  | BoardVideoStageData
  | TypingPracticeStageData;

// --- Individual Stage Schemas ---

export interface ConceptStageData {
  type: 'concept';
  content: {
    title?: string;
    explanation: string;
    audio?: string;
    example?: string;
    beforeAfter?: {
      before: string;
      after: string;
    };
    vs_comparison?: {
      left: { title: string; points: string[] };
      right: { title: string; points: string[] };
    };
    tip?: string;
    warning?: string;
    html_code?: string;
    blocks?: any[];
  };
}

export interface MCQStageData {
  type: 'mcq';
  questions: MCQQuestion[];
}

export interface MCQQuestion {
  question: string;
  options: string[];
  answer: number; // index of correct option
  explanation?: string;
}

export interface CodeStageData {
  type: 'code';
  challenge: {
    question: string;
    starterCode: string;
    solution: string;
    description?: string;
    language?: string;
    hint?: string;
    explanation?: string;
    
    // --- Advanced AI/Validation Extensions ---
    id?: string;
    title?: string;
    difficulty?: string;
    validation?: {
      type: 'variable_equals' | 'output_equals' | 'function_return' | 'array_shape' | 'datatype_check' | 'regex_match' | 'custom_test_cases';
      variable?: string;
      expected?: any;
      test_cases?: { input: string; expected: any }[];
      args?: any[];
      shape?: number[];
      datatype?: string;
      pattern?: string;
    };
    hints?: string[];
    concepts?: string[];
  };
}

export interface FillBlankStageData {
  type: 'fill_blank';
  sentences?: FillBlankItem[];
  challenge?: {
    title: string;
    question: string;
    template: string[];
    options?: string[];
    answers: Record<string, string>;
    explanation?: string;
    hint?: string;
  };
}

export interface FillBlankItem {
  text: string;       // Use ___ for blanks
  answer: string;
  hint?: string;
}

export interface FlashcardStageData {
  type: 'flashcard';
  cards: FlashcardItem[];
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface ReorderStageData {
  type: 'reorder';
  challenge: {
    instruction: string;
    correctOrder: string[];
  };
}

export interface ProjectStageData {
  type: 'project';
  project: {
    title: string;
    description: string;
    requirements: string[];
    starterCode?: string;
  };
}

export interface AIDiscussionStageData {
  type: 'ai_discussion';
  topic: {
    prompt: string;
    context: string;
    objectives: string[];
  };
}

// --- Advanced Stage Schemas ---

export interface SocraticStageData {
  type: 'socratic';
  topic?: string;
  seedQuestion?: string;
  guidingQuestions?: string[];
  expectedInsight?: string;
}

export interface RecallStageData {
  type: 'recall';
  prompt?: string;
  expectedKeywords?: string[];
  difficulty?: number; // 1-5
  timeLimit?: number;  // seconds
}

export interface ReflectionStageData {
  type: 'reflection';
  prompt?: string;
  minWords?: number;
  guidingPoints?: string[];
}

export interface ScenarioStageData {
  type: 'scenario';
  title?: string;
  description?: string;
  choices?: {
    text: string;
    outcome: string;
    score: number;
  }[];
}

export interface CaseStudyStageData {
  type: 'case_study';
  title?: string;
  context?: string;
  questions?: {
    question: string;
    expectedAnswer?: string;
  }[];
}

export interface InteractiveSimulationStageData {
  type: 'interactive_simulation';
  title?: string;
  description?: string;
  steps?: {
    label: string;
    action: string;
    description?: string;
  }[];
  goalDescription?: string;
}

export interface DragDropStageData {
  type: 'drag_drop';
  instruction?: string;
  items?: string[];
  correctOrder?: string[];
  categories?: {
    name: string;
    correctItems: string[];
  }[];
}

export interface SpeedQuizStageData {
  type: 'speed_quiz';
  questions?: {
    question: string;
    options: string[];
    answer: number;
  }[];
  timePerQuestion?: number; // seconds
}

export interface SystemDesignStageData {
  type: 'system_design';
  title?: string;
  scenario?: string;
  components?: string[];
  expectedConnections?: {
    from: string;
    to: string;
    label?: string;
  }[];
  hint?: string;
}

export interface AIConversationStageData {
  type: 'ai_conversation';
  topic?: string;
  systemPrompt?: string;
  context?: string;
  objectives?: string[];
  minTurns?: number;
}

export interface AIFeedbackStageData {
  type: 'ai_feedback';
  prompt?: string;
  rubric?: {
    clarity?: number;
    correctness?: number;
    improvement?: string;
  };
  expectedAnswer?: string;
}

export interface AIEvaluatorStageData {
  type: 'ai_evaluator';
  prompt?: string;
  expectedAnswer?: string;
  scoringCriteria?: string[];
}

export interface DebugAIStageData {
  type: 'debug_ai';
  brokenOutput?: string;
  correctOutput?: string;
  context?: string;
  hint?: string;
}

export interface PromptBuilderStageData {
  type: 'prompt_builder';
  objective?: string;
  components?: string[];
  exampleOutput?: string;
  evaluationCriteria?: string[];
}

export interface VisualStageData {
  type: 'visual';
  content: {
    title: string;
    diagram?: string[];
    explanation?: string;
    image?: string;
    type?: string;
    layout?: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
    layers?: any[];
    sidePanel?: any;
    steps?: any[];
    codePanel?: any;
    typeFlowPanel?: any;
    comparisonPanel?: any;
    mainFlow?: any;
    sidebar?: any;
    example?: any;
    bottomSection?: any;
    keyInsights?: any;
    [key: string]: any;
  };
}

export interface TeacherVisStageData {
  type: 'teacher_vis';
  content: {
    title: string;
    sections: {
      label: string;
      text?: string;
      code?: string;
    }[];
  };
}

export interface BoardVideoStageData {
  type: 'board_video';
  content: {
    title: string;
    voice?: boolean;
    sections: {
      label: string;
      lines: string[];
    }[];
  };
}

export interface TypingPracticeStageData {
  type: 'typing_practice';
  title?: string;
  codeToType?: string;
  explanation?: string;
  content?: {
    title?: string;
    codeToType?: string;
    explanation?: string;
    text?: string;
  };
}

// --- Engine Runtime Types ---

export interface StageResult {
  correct: boolean;
  score: number;        // 0-100
  feedback?: string;
  timeTaken?: number;   // ms
}

export interface StageComponentProps<T = StageJSON> {
  data: T;
  onComplete: (result: StageResult) => void;
}
