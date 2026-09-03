import { z } from 'zod';

export const PurchaseItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  type: z.enum(['SELF_PACED_COURSE', 'LIVE_COURSE', 'BUNDLE']).default('SELF_PACED_COURSE'),
});

export const PurchaseCheckoutSchema = z.object({
  items: z.array(PurchaseItemSchema).min(1, 'Cart cannot be empty'),
  paymentMethod: z.enum(['CARD', 'UPI', 'NET_BANKING']).default('CARD'),
  billingDetails: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').default('Student Learner'),
      email: z.string().email('Invalid email address').optional(),
    })
    .optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
});

export const VideoProgressSchema = z.object({
  lectureId: z.string().min(1, 'lectureId is required'),
  progressSeconds: z.number().min(0, 'progressSeconds cannot be negative'),
  durationSeconds: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const RecordingProgressSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  secondsWatched: z.number().min(0, 'secondsWatched cannot be negative'),
  totalDurationSeconds: z.number().min(0).optional(),
  percent: z.number().min(0).max(100).optional(),
  resumeTimestampSeconds: z.number().min(0).optional(),
  status: z.enum(['UNWATCHED', 'IN_PROGRESS', 'WATCHED']).optional(),
});

export const AssignmentSubmissionSchema = z.object({
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid Live Demo URL').optional().or(z.literal('')),
  fileUrl: z.string().optional().or(z.literal('')),
  fileName: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional().or(z.literal('')),
}).refine(
  (data) => Boolean(data.githubUrl || data.liveUrl || data.fileUrl || data.fileName || data.notes),
  { message: 'Please provide a GitHub repo, live demo URL, notes, or uploaded project file' }
);

export const AttendanceHeartbeatSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT']).default('PRESENT'),
  durationMinutes: z.number().min(0).max(480).default(0),
  joinedLateMinutes: z.number().min(0).default(0),
  notes: z.string().max(500).optional(),
});

export const StudentNoteSchema = z.object({
  sessionId: z.string().optional(),
  lectureId: z.string().optional(),
  timestampSeconds: z.number().min(0).default(0),
  content: z.string().min(1, 'Note content cannot be empty').max(5000, 'Note cannot exceed 5000 characters'),
}).refine((data) => Boolean(data.sessionId || data.lectureId), {
  message: 'Note must be linked to either a live session or a self-paced lecture',
});
