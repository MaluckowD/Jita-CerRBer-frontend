import type { TaskInfoResponse, TaskStage, ProjectInfoResponse } from "../../../lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "../ui/utils";

const columns: { stage: TaskStage; label: string; color: string; bg: string }[] = [
  { stage: "NEW", label: "Новые", color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
  { stage: "IN_PROGRESS", label: "В работе", color: "text-amber-700", bg: "bg-amber-100 border-amber-200" },
  { stage: "DONE", label: "Готово", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200" },
];

interface Props {
  tasks: TaskInfoResponse[];
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}

export function KanbanBoard({ tasks, project, onTaskUpdated, onTaskDeleted }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6 pt-2 min-h-[calc(100vh-280px)]">
      {columns.map(({ stage, label, color, bg }) => {
        const stageTasks = tasks.filter((t) => t.stage === stage);
        return (
          <div key={stage} className="flex flex-col w-80 max-w-[85vw] shrink-0">
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border mb-3", bg)}>
              <span className={cn("text-xs font-medium", color)}>{label}</span>
              <span className={cn("ml-auto text-xs px-1.5 py-0.5 rounded font-mono bg-white/70 border border-white/80", color)}>
                {stageTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {stageTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={project}
                  onTaskUpdated={onTaskUpdated}
                  onTaskDeleted={onTaskDeleted}
                />
              ))}
              {stageTasks.length === 0 && (
                <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center min-h-24 bg-card/60">
                  <p className="text-xs text-muted-foreground">Нет задач</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
