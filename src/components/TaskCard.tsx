import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { getPriorityColor, formatDate } from "../utils/kanban";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <div className="task-header">
        <div
          className="priority-indicator"
          style={{ backgroundColor: priorityColor }}
        />
        <div className="task-actions">
          <button
            className="task-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            aria-label="Edit task"
          >
            <Edit size={16} />
          </button>
          <button
            className="task-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="priority-badge" style={{ color: priorityColor }}>
          {task.priority.toUpperCase()}
        </div>
        {task.dueDate && (
          <div className="due-date">
            <Calendar size={14} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
        <div className="created-date">
          <Clock size={14} />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
