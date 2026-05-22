import type { HistoryEntry } from '@/types';

const HISTORY_KEY = 'siyayo.history.v1';
const MAX_HISTORY = 30;

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  const list = loadHistory();
  list.unshift(entry);
  while (list.length > MAX_HISTORY) list.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
