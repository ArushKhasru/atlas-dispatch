import { stateSchema, type State } from './domain';
import { createSeed } from './seed';
export const STORAGE_KEY = 'atlas-dispatch-v1';
// Browser storage is optional: invalid or unavailable data must not stop the demo.
export function loadState(): { state: State; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createSeed(), warning: '' };
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return {
        state: createSeed(),
        warning:
          'Saved data was invalid, so the original demo is loaded. Your next change or reset will replace the invalid saved data.',
      };
    return { state: parsed.data, warning: '' };
  } catch {
    return {
      state: createSeed(),
      warning:
        'Browser storage could not be read. The demo still works in this tab; changes may not survive a reload.',
    };
  }
}
export function saveState(state: State): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return '';
  } catch {
    return 'Changes are in this tab only. Browser storage is unavailable; export your data before leaving.';
  }
}
