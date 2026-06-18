import { useDrop } from "react-dnd";
import type { TaskInfoResponse, TaskStage, ProjectInfoResponse } from "../../../lib/types";
import { tasksApi } from "../../../lib/api";
import { TaskCard, TASK_DND_TYPE, type TaskDragItem } from "./TaskCard";
import { cn } from "../ui/utils";

const columns: { stage: TaskStage; label: string; color: string; bg: string }[] = [
  { stage: "NEW", label: "Новые", color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
  { stage: "IN_PROGRESS", label: "В работе", color: "text-amber-700", bg: "bg-amber-100 border-amber-200" },
  { stage: "DONE", label: "Готово", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200" },
];

const stageOrder: TaskStage[] = ["NEW", "IN_PROGRESS", "DONE"];

function isNextStage(from: TaskStage, to: TaskStage): boolean {
  return stageOrder.indexOf(to) === stageOrder.indexOf(from) + 1;
}

interface Props {
  tasks: TaskInfoResponse[];
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}

export function KanbanBoard({ tasks, project, onTaskUpdated, onTaskDeleted }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6 pt-2 min-h-[calc(100vh-280px)]">
      {columns.map((column) => (
        <KanbanColumn
          key={column.stage}
          column={column}
          tasks={tasks.filter((task) => task.stage === column.stage)}
          project={project}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  project,
  onTaskUpdated,
  onTaskDeleted,
}: {
  column: (typeof columns)[number];
  tasks: TaskInfoResponse[];
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: TASK_DND_TYPE,
      canDrop: (item: TaskDragItem) => isNextStage(item.stage, column.stage),
      drop: (item: TaskDragItem) => {
        if (!isNextStage(item.stage, column.stage)) return;
        const previousStage = item.stage;
        item.stage = column.stage;
        tasksApi.nextStage(item.id)
          .then(onTaskUpdated)
          .catch(() => {
            item.stage = previousStage;
          });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [column.stage, onTaskUpdated],
  );

  return (
    <div ref={dropRef} className="flex flex-col w-80 max-w-[85vw] shrink-0">
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border mb-3", column.bg)}>
        <span className={cn("text-xs font-medium", column.color)}>{column.label}</span>
        <span className={cn("ml-auto text-xs px-1.5 py-0.5 rounded font-mono bg-white/70 border border-white/80", column.color)}>
          {tasks.length}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-col gap-2 flex-1 rounded-lg transition-colors",
          isOver && canDrop && "bg-primary/5 ring-2 ring-primary/25 ring-offset-2 ring-offset-background",
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            project={project}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}
        {tasks.length === 0 && (
          <div
            className={cn(
              "flex-1 border border-dashed border-border rounded-lg flex items-center justify-center min-h-24 bg-card/60 transition-colors",
              isOver && canDrop && "border-primary bg-primary/5",
            )}
          >
            <p className="text-xs text-muted-foreground">Перетащите задачу сюда</p>
          </div>
        )}
      </div>
    </div>
  );
}
