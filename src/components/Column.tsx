import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Column as ColumnType, Task } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className={`column ${isOver ? "column-over" : ""}`}>
      <div className="column-header">
        <h2 className="column-title">{column.title}</h2>
        <span className="task-count">{tasks.length}</span>
        <button
          className="add-task-btn"
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.title}`}
        >
          <Plus size={20} />
        </button>
      </div>

      <div ref={setNodeRef} className="task-list">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="empty-column">
            <p>No tasks yet</p>
            <button
              className="add-first-task-btn"
              onClick={() => onAddTask(column.id)}
            >
              Add your first task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
