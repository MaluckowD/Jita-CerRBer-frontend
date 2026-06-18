import type { TaskInfoResponse, TaskStage, ProjectInfoResponse } from "../../../lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "../ui/utils";

const columns: { stage: TaskStage; label: string; color: string; bg: string }[] = [
  { stage: "NEW", label: "Новые", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
  { stage: "IN_PROGRESS", label: "В работе", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { stage: "DONE", label: "Готово", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
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
          <div key={stage} className="flex flex-col w-72 shrink-0">
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border mb-3", bg)}>
              <span className={cn("text-xs font-medium", color)}>{label}</span>
              <span className={cn("ml-auto text-xs px-1.5 py-0.5 rounded font-mono", color, "bg-black/20")}>
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
                <div className="flex-1 border border-dashed border-border rounded-lg flex items-center justify-center min-h-24">
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
