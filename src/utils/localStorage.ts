import type { KanbanData } from "../types";

const STORAGE_KEY = "kanban-board-data";

export const loadKanbanData = (): KanbanData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return null;
  }
};

export const saveKanbanData = (data: KanbanData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

export const clearKanbanData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing data from localStorage:", error);
  }
};
