import { v4 as uuidv4 } from "uuid";
import type { KanbanData, Task, Priority } from "../types";

export const createInitialData = (): KanbanData => {
  const todoColumnId = "column-1";
  const inProgressColumnId = "column-2";
  const doneColumnId = "column-3";

  const task1Id = uuidv4();
  const task2Id = uuidv4();
  const task3Id = uuidv4();

  return {
    tasks: {
      [task1Id]: {
        id: task1Id,
        title: "Design landing page",
        description: "Create a modern and responsive landing page design",
        priority: "high",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [task2Id]: {
        id: task2Id,
        title: "Implement user authentication",
        description: "Set up login and registration functionality",
        priority: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [task3Id]: {
        id: task3Id,
        title: "Write unit tests",
        description: "Add comprehensive test coverage for components",
        priority: "low",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    columns: {
      [todoColumnId]: {
        id: todoColumnId,
        title: "To Do",
        taskIds: [task1Id],
      },
      [inProgressColumnId]: {
        id: inProgressColumnId,
        title: "In Progress",
        taskIds: [task2Id],
      },
      [doneColumnId]: {
        id: doneColumnId,
        title: "Done",
        taskIds: [task3Id],
      },
    },
    columnOrder: [todoColumnId, inProgressColumnId, doneColumnId],
  };
};

export const createTask = (
  title: string,
  description: string,
  priority: Priority,
  dueDate?: string
): Task => {
  return {
    id: uuidv4(),
    title,
    description,
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case "high":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // amber
    case "low":
      return "#10b981"; // emerald
    default:
      return "#6b7280"; // gray
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const updateTaskCompletionDate = (
  task: Task,
  newColumnId: string
): Task => {
  // If task is moved to "Done" column, update completion date
  if (newColumnId === "column-3" && !task.completedAt) {
    return {
      ...task,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // If task is moved away from "Done" column, remove completion date
  if (newColumnId !== "column-3" && task.completedAt) {
    const { completedAt, ...taskWithoutCompletion } = task;
    return {
      ...taskWithoutCompletion,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...task,
    updatedAt: new Date().toISOString(),
  };
};
