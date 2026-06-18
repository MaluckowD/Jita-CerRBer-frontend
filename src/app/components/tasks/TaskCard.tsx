import { useState } from "react";
import type { TaskInfoResponse, ProjectInfoResponse } from "../../../lib/types";
import { cn } from "../ui/utils";
import { TaskDetailModal } from "./TaskDetailModal";
import { ArrowRight, AlertCircle, Clock, User } from "lucide-react";
import { tasksApi } from "../../../lib/api";

const priorityConfig = {
  LOW: { label: "Низкий", class: "text-emerald-400", dot: "bg-emerald-400" },
  MEDIUM: { label: "Средний", class: "text-amber-400", dot: "bg-amber-400" },
  HIGH: { label: "Высокий", class: "text-red-400", dot: "bg-red-400" },
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
        onClick={() => setDetailOpen(true)}
        className={cn(
          "bg-card border border-border rounded-lg p-3 cursor-pointer group",
          "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground font-mono">{project.shortname}-{task.short_id}</span>
          <div className="flex items-center gap-1">
            <span className={cn("text-[10px]", pri.class)}>{pri.label}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full", pri.dot)} />
          </div>
        </div>

        <p className="text-sm text-foreground leading-snug mb-2 line-clamp-2">{task.name}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.planned_end && (
            <span className={cn("flex items-center gap-1", new Date(task.planned_end) < new Date() && task.stage !== "DONE" && "text-red-400")}>
              <Clock className="size-3" />
              {task.planned_end}
            </span>
          )}
          {task.assignee_id && (
            <span className="flex items-center gap-1">
              <User className="size-3" />
            </span>
          )}
          {task.stage !== "DONE" && (
            <button
              onClick={handleNextStage}
              disabled={advancing}
              className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 text-primary hover:text-primary/80 transition-all"
            >
              <ArrowRight className="size-3" />
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
