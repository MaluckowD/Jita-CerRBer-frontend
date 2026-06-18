import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { projectsApi, tasksApi } from "../../../lib/api";
import type { ProjectInfoResponse, TaskInfoResponse } from "../../../lib/types";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { KanbanBoard } from "../tasks/KanbanBoard";
import { TaskListView } from "../tasks/TaskListView";
import { CreateTaskDialog } from "../tasks/CreateTaskDialog";
import { ProjectSettingsTab } from "./ProjectSettingsTab";
import { cn } from "../ui/utils";
import { ArrowLeft, Plus, Settings, FolderKanban, List, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectInfoResponse | null>(null);
  const [tasks, setTasks] = useState<TaskInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const [proj, taskList] = await Promise.all([
        projectsApi.getById(projectId),
        tasksApi.getAll({ project_id: projectId }),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch {}
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const handleTaskCreated = (task: TaskInfoResponse) => {
    setTasks((t) => [task, ...t]);
  };

  const handleTaskUpdated = (updated: TaskInfoResponse) => {
    setTasks((t) => t.map((task) => (task.id === updated.id ? updated : task)));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((t) => t.filter((task) => task.id !== taskId));
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    try {
      await projectsApi.delete(projectId);
      navigate("/projects");
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-card rounded" />
        <div className="h-4 w-72 bg-card rounded" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Проект не найден</p>
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mt-3">
          Назад к проектам
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" onClick={() => navigate("/projects")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-[10px] text-primary font-mono">{project.shortname}</span>
            </div>
            <h1 className="text-foreground">{project.name}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setCreateTaskOpen(true)} size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Задача
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-popover border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Удалить проект?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Это действие необратимо. Проект «{project.name}» и все его задачи будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="board" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-0 border-0">
            {[
              { value: "board", label: "Доска" },
              { value: "settings", label: "Настройки", icon: Settings },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground gap-1.5",
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="board" className="mt-0">
              <div className="flex items-center gap-2 px-0 py-3">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => setView("kanban")}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all",
                      view === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <FolderKanban className="size-3.5" />Kanban
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all",
                      view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <List className="size-3.5" />Список
                  </button>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">{tasks.length} задач</span>
              </div>

              {view === "kanban" ? (
                <KanbanBoard
                  tasks={tasks}
                  project={project}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              ) : (
                <TaskListView
                  tasks={tasks}
                  project={project}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <ProjectSettingsTab project={project} onProjectUpdated={setProject} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        project={project}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}
