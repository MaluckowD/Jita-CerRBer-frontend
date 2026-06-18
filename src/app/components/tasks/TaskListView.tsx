import { useState } from "react";
import type { TaskInfoResponse, ProjectInfoResponse } from "../../../lib/types";
import { cn } from "../ui/utils";
import { TaskDetailModal } from "./TaskDetailModal";
import { Clock, ArrowRight, User } from "lucide-react";
import { tasksApi } from "../../../lib/api";

const priorityConfig = {
  LOW: { label: "Низкий", dotClass: "bg-emerald-500" },
  MEDIUM: { label: "Средний", dotClass: "bg-amber-500" },
  HIGH: { label: "Высокий", dotClass: "bg-red-500" },
};

const stageConfig = {
  NEW: { label: "Новая", class: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "В работе", class: "bg-amber-100 text-amber-700" },
  DONE: { label: "Готово", class: "bg-emerald-100 text-emerald-700" },
};

interface Props {
  tasks: TaskInfoResponse[];
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}

export function TaskListView({ tasks, project, onTaskUpdated, onTaskDeleted }: Props) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleNextStage = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    try {
      const updated = await tasksApi.nextStage(taskId);
      onTaskUpdated(updated);
    } catch {}
  };

  if (tasks.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-muted-foreground text-sm">Нет задач. Создайте первую!</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pb-6">
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium w-24">ID</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Название</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium w-36">Исполнитель</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium w-28">Статус</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium w-28">Приоритет</th>
                <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium w-28">Срок</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const pri = priorityConfig[task.priority];
                const stage = stageConfig[task.stage];
                const overdue = task.planned_end && new Date(task.planned_end) < new Date() && task.stage !== "DONE";
                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{project.shortname}-{task.short_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground line-clamp-1">{task.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="size-3 shrink-0" />
                        {task.assignee_id ? "Назначена" : "Без исполнителя"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-md whitespace-nowrap", stage.class)}>{stage.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", pri.dotClass)} />
                        <span className="text-xs text-muted-foreground">{pri.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {task.planned_end ? (
                        <span className={cn("text-xs flex items-center gap-1 whitespace-nowrap", overdue ? "text-red-600" : "text-muted-foreground")}>
                          <Clock className="size-3 shrink-0" />
                          {task.planned_end}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">-</span>
                      )}
                    </td>
                    <td className="px-2">
                      {task.stage !== "DONE" && (
                        <button
                          onClick={(e) => handleNextStage(e, task.id)}
                          className="flex size-7 items-center justify-center rounded-md text-primary hover:bg-primary/10 hover:text-primary transition-all"
                          aria-label="Перевести задачу дальше"
                        >
                          <ArrowRight className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          open={!!selectedTask}
          onOpenChange={(v) => { if (!v) setSelectedTask(null); }}
          taskId={selectedTask}
          project={project}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      )}
    </>
  );
}
