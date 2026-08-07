// ============================================================
// Backend-Ready Types — Future Multi-User / SaaS Architecture
// ============================================================
// Interfaces only. No implementation needed yet.
// These define the contract for when a real backend is added.
// ============================================================

// --- Authentication ---

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'learner' | 'instructor' | 'admin';
  organizationId?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: number;
  refreshToken: string;
}

// --- Progress Persistence ---

export interface UserProgress {
  userId: string;
  courseId: string;
  currentLessonIndex: number;
  currentStageIndex: number;
  completedLessons: string[];
  xp: number;
  level: number;
  streak: number;
  lastActiveAt: number;
  totalTimeMs: number;
}

export interface StageAttempt {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  stageIndex: number;
  stageType: string;
  userInput: string;
  score: number;
  correct: boolean;
  timeTakenMs: number;
  aiEvaluation?: Record<string, unknown>;
  createdAt: number;
}

// --- Multi-Tenant / SaaS ---

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  maxUsers: number;
  customDomain?: string;
  branding?: {
    logo: string;
    primaryColor: string;
    accentColor: string;
  };
  createdAt: number;
}

export interface CourseAssignment {
  organizationId: string;
  courseId: string;
  assignedBy: string;
  assignedAt: number;
  dueDate?: number;
}

// --- Leaderboard ---

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  coursesCompleted: number;
  rank: number;
}

// --- API Contracts ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    total?: number;
    timestamp: number;
  };
}

// --- Service Interfaces ---

export interface IAuthService {
  login(email: string, password: string): Promise<ApiResponse<AuthSession>>;
  register(email: string, password: string, displayName: string): Promise<ApiResponse<AuthUser>>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ApiResponse<AuthUser>>;
  refreshToken(refreshToken: string): Promise<ApiResponse<AuthSession>>;
}

export interface IProgressService {
  getProgress(userId: string, courseId: string): Promise<ApiResponse<UserProgress>>;
  saveProgress(progress: UserProgress): Promise<ApiResponse<UserProgress>>;
  recordAttempt(attempt: StageAttempt): Promise<ApiResponse<StageAttempt>>;
  getAttemptHistory(userId: string, courseId: string): Promise<ApiResponse<StageAttempt[]>>;
}

export interface ICourseService {
  getCourses(orgId?: string): Promise<ApiResponse<CourseMetadataResponse[]>>;
  getCourse(courseId: string): Promise<ApiResponse<unknown>>;
  getLeaderboard(courseId: string): Promise<ApiResponse<LeaderboardEntry[]>>;
}

export interface CourseMetadataResponse {
  courseId: string;
  title: string;
  description: string;
  totalLessons: number;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}
