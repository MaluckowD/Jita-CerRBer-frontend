import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { projectsApi, tasksApi } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import type { ProjectInfoResponse, TaskInfoResponse } from "../../../lib/types";
import { cn } from "../ui/utils";
import { FolderKanban, CheckCircle2, Clock, AlertCircle, ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectInfoResponse[]>([]);
  const [myTasks, setMyTasks] = useState<TaskInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectsApi.getAll(),
      user ? tasksApi.getAll({ assignee_id: user.id }) : Promise.resolve([]),
    ]).then(([p, t]) => {
      setProjects(p);
      setMyTasks(t);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const newTasks = myTasks.filter((t) => t.stage === "NEW");
  const inProgressTasks = myTasks.filter((t) => t.stage === "IN_PROGRESS");
  const doneTasks = myTasks.filter((t) => t.stage === "DONE");
  const overdueTasks = myTasks.filter((t) => t.planned_end && new Date(t.planned_end) < new Date() && t.stage !== "DONE");

  const stats = [
    { label: "Мои задачи", value: myTasks.length, icon: FolderKanban, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { label: "В работе", value: inProgressTasks.length, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Завершено", value: doneTasks.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Просрочено", value: overdueTasks.length, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Привет, {user?.name}!</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        <Button onClick={() => navigate("/projects")} variant="outline" size="sm" className="gap-1.5 border-border">
          <Plus className="size-3.5" />
          Новый проект
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn("flex items-center gap-3 p-4 rounded-xl border bg-card", bg.split(" ")[1])}>
            <div className={cn("p-2 rounded-lg", bg)}>
              <Icon className={cn("size-4", color)} />
            </div>
            <div>
              <p className="text-2xl text-foreground leading-none mb-0.5">{loading ? "—" : value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My tasks in progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground text-sm">Задачи в работе</h3>
            <span className="text-xs text-muted-foreground">{inProgressTasks.length}</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : inProgressTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Нет задач в работе</p>
          ) : (
            <div className="space-y-2">
              {inProgressTasks.slice(0, 5).map((task) => {
                const proj = projects.find((p) => p.id === task.project_id);
                return (
                  <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">{proj?.shortname}-{task.short_id}</span>
                    <p className="text-sm text-foreground flex-1 line-clamp-1">{task.name}</p>
                    {task.planned_end && (
                      <span className={cn("text-[10px] text-muted-foreground shrink-0", new Date(task.planned_end) < new Date() && "text-red-400")}>
                        {task.planned_end}
                      </span>
                    )}
                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground text-sm">Мои проекты</h3>
            <button onClick={() => navigate("/projects")} className="text-xs text-primary hover:text-primary/80 transition-colors">Все →</button>
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : projects.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Нет проектов</p>
              <Button size="sm" onClick={() => navigate("/projects")} variant="outline" className="border-border text-xs gap-1">
                <Plus className="size-3" />Создать
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-[9px] text-primary font-mono">{p.shortname}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.components.length} компонентов</p>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="size-4 text-red-400" />
            <h3 className="text-red-400 text-sm">Просроченные задачи</h3>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => {
              const proj = projects.find((p) => p.id === task.project_id);
              return (
                <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
                  <span className="text-[10px] font-mono text-red-400/70 shrink-0">{proj?.shortname}-{task.short_id}</span>
                  <p className="text-sm text-foreground flex-1 line-clamp-1">{task.name}</p>
                  <span className="text-xs text-red-400 shrink-0">{task.planned_end}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
