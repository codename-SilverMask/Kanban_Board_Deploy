import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { KanbanData, Task, TaskFormData } from "../types";
import { createInitialData, createTask } from "../utils/kanban";
import { loadKanbanData, saveKanbanData } from "../utils/localStorage";
import Column from "./Column";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<KanbanData>(createInitialData());
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    task?: Task;
    columnId?: string;
  }>({
    isOpen: false,
    mode: "add",
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadKanbanData();
    if (savedData) {
      setData(savedData);
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    saveKanbanData(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = data.tasks[active.id as string];
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setData((prev) => {
      const activeItems = prev.columns[activeContainer].taskIds;
      const overItems = prev.columns[overContainer].taskIds;

      // Find the indexes for the items
      const overIndex = overItems.indexOf(overId);

      let newIndex: number;
      if (overId in prev.columns) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over && overIndex >= 0;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [activeContainer]: {
            ...prev.columns[activeContainer],
            taskIds: activeItems.filter((item) => item !== activeId),
          },
          [overContainer]: {
            ...prev.columns[overContainer],
            taskIds: [
              ...overItems.slice(0, newIndex),
              activeId,
              ...overItems.slice(newIndex, overItems.length),
            ],
          },
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      setActiveTask(null);
      return;
    }

    const activeIndex = data.columns[activeContainer].taskIds.indexOf(activeId);
    const overIndex = data.columns[overContainer].taskIds.indexOf(overId);

    if (activeIndex !== overIndex) {
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [overContainer]: {
            ...prev.columns[overContainer],
            taskIds: arrayMove(
              prev.columns[overContainer].taskIds,
              activeIndex,
              overIndex
            ),
          },
        },
      }));
    }

    setActiveTask(null);
  };

  const findContainer = (id: string) => {
    if (id in data.columns) {
      return id;
    }

    return Object.keys(data.columns).find((key) =>
      data.columns[key].taskIds.includes(id)
    );
  };

  const handleAddTask = (columnId: string) => {
    setModalState({
      isOpen: true,
      mode: "add",
      columnId,
    });
  };

  const handleEditTask = (task: Task) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      task,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setData((prev) => {
        const newData = { ...prev };

        // Remove task from tasks object
        delete newData.tasks[taskId];

        // Remove task ID from all columns
        Object.keys(newData.columns).forEach((columnId) => {
          newData.columns[columnId] = {
            ...newData.columns[columnId],
            taskIds: newData.columns[columnId].taskIds.filter(
              (id) => id !== taskId
            ),
          };
        });

        return newData;
      });
    }
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    if (modalState.mode === "add" && modalState.columnId) {
      // Add new task
      const newTask = createTask(
        taskData.title,
        taskData.description,
        taskData.priority,
        taskData.dueDate
      );

      setData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTask.id]: newTask,
        },
        columns: {
          ...prev.columns,
          [modalState.columnId!]: {
            ...prev.columns[modalState.columnId!],
            taskIds: [
              ...prev.columns[modalState.columnId!].taskIds,
              newTask.id,
            ],
          },
        },
      }));
    } else if (modalState.mode === "edit" && modalState.task) {
      // Update existing task
      const updatedTask: Task = {
        ...modalState.task,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        updatedAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [updatedTask.id]: updatedTask,
        },
      }));
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
    });
  };

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="columns-container">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        task={modalState.task}
        title={modalState.mode === "add" ? "Add New Task" : "Edit Task"}
      />
    </div>
  );
};

export default KanbanBoard;
