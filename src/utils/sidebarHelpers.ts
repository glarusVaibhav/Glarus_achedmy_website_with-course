// ============================================================
// Sidebar Helper Utilities — Storage & DOM Interactions
// ============================================================

/**
 * Smoothly scrolls the active topic node into view in the sidebar.
 * 
 * @param elementId The DOM ID of the element to scroll to
 */
export function scrollActiveTopicIntoView(elementId: string): void {
  if (typeof window === 'undefined') return;

  // Run in a small timeout to let Framer Motion accordion height transitions settle
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Use standard modern scrollIntoView with smooth behavior
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, 100);
}

/**
 * Loads expanded module accordion states from localStorage.
 * Scoped by courseId so multiple courses have independent sidebar states.
 */
export function getSavedExpandedModules(courseId: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const key = `sidebar_expanded_${courseId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.warn('[SidebarHelpers] Failed to load expanded states:', err);
    return {};
  }
}

/**
 * Saves expanded module accordion states into localStorage.
 */
export function saveExpandedModules(courseId: string, expanded: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `sidebar_expanded_${courseId}`;
    localStorage.setItem(key, JSON.stringify(expanded));
  } catch (err) {
    console.warn('[SidebarHelpers] Failed to save expanded states:', err);
  }
}
