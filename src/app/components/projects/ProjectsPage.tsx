import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { projectsApi } from "../../../lib/api";
import type { ProjectInfoResponse, ProjectCreate } from "../../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { cn } from "../ui/utils";
import { Plus, FolderKanban, ChevronRight, Calendar, User, Layers } from "lucide-react";
import { format } from "date-fns";

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const data: ProjectCreate = {
      name: fd.get("name") as string,
      shortname: (fd.get("shortname") as string).toUpperCase(),
      description: (fd.get("description") as string) || null,
    };
    try {
      const proj = await projectsApi.create(data);
      setProjects((p) => [proj, ...p]);
      setCreateOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка создания");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-foreground">Проекты</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projects.length} {projects.length === 1 ? "проект" : "проектов"}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Новый проект
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Нет проектов. Создайте первый!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-popover border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Новый проект</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Название проекта</Label>
              <Input name="name" placeholder="Мой проект" required className="bg-input-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Короткое имя (ключ)</Label>
              <Input name="shortname" placeholder="PRJ" maxLength={6} required className="bg-input-background border-border uppercase" />
              <p className="text-xs text-muted-foreground">2-6 символов, будет использоваться как префикс задач</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Описание</Label>
              <Textarea name="description" placeholder="Краткое описание проекта..." rows={3} className="bg-input-background border-border resize-none" />
            </div>
            {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md p-2.5 border border-destructive/20">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-border">
                Отмена
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Создаём..." : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: ProjectInfoResponse; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group min-w-0",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-xs text-primary font-mono">{project.shortname}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.name}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
        <span className="flex items-center gap-1 min-w-0">
          <User className="size-3" />
          <span className="truncate">{project.lead.name} {project.lead.surname}</span>
        </span>
        <span className="flex items-center gap-1">
          <Layers className="size-3" />
          {project.components.length} компонентов
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="size-3" />
          {format(new Date(project.created_at), "dd.MM.yy")}
        </span>
      </div>
    </button>
  );
}
