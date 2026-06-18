import { useState } from "react";
import { useDrag } from "react-dnd";
import type { TaskInfoResponse, TaskStage, ProjectInfoResponse } from "../../../lib/types";
import { cn } from "../ui/utils";
import { TaskDetailModal } from "./TaskDetailModal";
import { ArrowRight, Clock, GripVertical, User } from "lucide-react";
import { tasksApi } from "../../../lib/api";

export const TASK_DND_TYPE = "task-card";

export interface TaskDragItem {
  id: string;
  stage: TaskStage;
}

const priorityConfig = {
  LOW: { label: "Низкий", class: "text-emerald-600", dot: "bg-emerald-500" },
  MEDIUM: { label: "Средний", class: "text-amber-600", dot: "bg-amber-500" },
  HIGH: { label: "Высокий", class: "text-red-600", dot: "bg-red-500" },
};

interface Props {
  task: TaskInfoResponse;
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}

export function TaskCard({ task, project, onTaskUpdated, onTaskDeleted }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const pri = priorityConfig[task.priority];
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: TASK_DND_TYPE,
      item: { id: task.id, stage: task.stage },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [task.id, task.stage],
  );

  const handleNextStage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.stage === "DONE") return;
    setAdvancing(true);
    try {
      const updated = await tasksApi.nextStage(task.id);
      onTaskUpdated(updated);
    } catch {}
    setAdvancing(false);
  };

  return (
    <>
      <div
        ref={dragRef}
        onClick={() => setDetailOpen(true)}
        className={cn(
          "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing min-w-0",
          "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all",
          isDragging && "opacity-45 shadow-none",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono truncate">{project.shortname}-{task.short_id}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0 shrink-0">
            <span className={cn("text-[10px] truncate", pri.class)}>{pri.label}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", pri.dot)} />
          </div>
        </div>

        <p className="text-sm text-foreground leading-snug mb-3 line-clamp-2">{task.name}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 min-w-0 max-w-full">
            <User className="size-3 shrink-0" />
            <span className="truncate">{task.assignee_id ? "Назначена" : "Без исполнителя"}</span>
          </span>
          {task.planned_end && (
            <span className={cn("flex items-center gap-1 shrink-0", new Date(task.planned_end) < new Date() && task.stage !== "DONE" && "text-red-600")}>
              <Clock className="size-3 shrink-0" />
              {task.planned_end}
            </span>
          )}
          {task.stage !== "DONE" && (
            <button
              onClick={handleNextStage}
              disabled={advancing}
              className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-primary hover:bg-primary/10 hover:text-primary transition-all"
              aria-label="Перевести задачу дальше"
            >
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <TaskDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        taskId={task.id}
        project={project}
        onTaskUpdated={onTaskUpdated}
        onTaskDeleted={onTaskDeleted}
      />
    </>
  );
}
