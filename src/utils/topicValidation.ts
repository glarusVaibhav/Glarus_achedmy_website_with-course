// ============================================================
// Topic Validation Layer — Schema & Reference Integrity (New Schema)
// ============================================================

import type { RawModule, RawTopic, RawLesson, ValidationError } from '@/types/sidebar.types';

/**
 * Validates a module object against schema requirements.
 */
export function validateModule(module: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const entityId = module?.module_id || 'unknown_module';

  if (!module) {
    errors.push({
      type: 'module',
      entityId,
      message: 'Module data is null or undefined.',
    });
    return errors;
  }

  if (typeof module.module_id !== 'string' || !module.module_id.trim()) {
    errors.push({
      type: 'module',
      entityId,
      message: 'Module is missing a valid module_id.',
    });
  }

  if (typeof module.module_title !== 'string' || !module.module_title.trim()) {
    errors.push({
      type: 'module',
      entityId,
      message: `Module "${entityId}" is missing a module_title.`,
    });
  }

  if (typeof module.order !== 'number') {
    errors.push({
      type: 'module',
      entityId,
      message: `Module "${entityId}" has an invalid or missing "order" number.`,
    });
  }

  if (!Array.isArray(module.topic_ids)) {
    errors.push({
      type: 'module',
      entityId,
      message: `Module "${entityId}" is missing a "topic_ids" array.`,
    });
  }

  return errors;
}

/**
 * Validates a topic item inside the topics registry.
 */
export function validateTopic(topic: any, parentModuleId: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const entityId = topic?.topic_id || 'unknown_topic';

  if (!topic) {
    errors.push({
      type: 'topic',
      entityId,
      message: `Topic is null or undefined in module "${parentModuleId}".`,
    });
    return errors;
  }

  if (typeof topic.topic_id !== 'string' || !topic.topic_id.trim()) {
    errors.push({
      type: 'topic',
      entityId,
      message: `Topic is missing a valid "topic_id" inside module "${parentModuleId}".`,
    });
  }

  if (typeof topic.topic_title !== 'string' || !topic.topic_title.trim()) {
    errors.push({
      type: 'topic',
      entityId,
      message: `Topic "${entityId}" is missing a "topic_title".`,
    });
  }

  if (topic.module_id !== parentModuleId) {
    errors.push({
      type: 'topic',
      entityId,
      message: `Topic "${entityId}" is linked to module "${topic.module_id}" but was referenced inside module "${parentModuleId}".`,
    });
  }

  if (!Array.isArray(topic.lesson_ids)) {
    errors.push({
      type: 'topic',
      entityId,
      message: `Topic "${entityId}" is missing a "lesson_ids" array.`,
    });
  }

  return errors;
}

/**
 * Validates that a lesson ID maps to a real lesson inside lessons.json.
 */
export function validateLessonReference(
  lessonId: string,
  lessonsMap: Map<string, RawLesson>
): boolean {
  return lessonsMap.has(lessonId);
}
