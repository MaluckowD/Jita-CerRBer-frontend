import { useState } from "react";
import { tasksApi } from "../../../lib/api";
import type { ProjectInfoResponse, TaskInfoResponse, TaskPriority } from "../../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: ProjectInfoResponse;
  onCreated: (task: TaskInfoResponse) => void;
}

export function CreateTaskDialog({ open, onOpenChange, project, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [classificationId, setClassificationId] = useState<string>("none");
  const [componentId, setComponentId] = useState<string>("none");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const task = await tasksApi.create({
        project_id: project.id,
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || project.task_description_template || "",
        priority,
        initiative_classification_id: classificationId !== "none" ? classificationId : null,
        component_id: componentId !== "none" ? componentId : null,
        planned_start: (fd.get("planned_start") as string) || null,
        planned_end: (fd.get("planned_end") as string) || null,
      });
      onCreated(task);
      onOpenChange(false);
      setPriority("MEDIUM");
      setClassificationId("none");
      setComponentId("none");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка создания задачи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Новая задача · {project.shortname}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Название задачи *</Label>
            <Input name="name" placeholder="Краткое описание задачи" required className="bg-input-background border-border" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Описание</Label>
            <Textarea
              name="description"
              placeholder={project.task_description_template || "Подробное описание..."}
              rows={4}
              className="bg-input-background border-border resize-none text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Приоритет</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {project.components.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm">Компонент</Label>
                <Select value={componentId} onValueChange={setComponentId}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="none">Не выбран</SelectItem>
                    {project.components.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {project.initiative_classifications.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Тип инициативы</Label>
              <Select value={classificationId} onValueChange={setClassificationId}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">Не выбран</SelectItem>
                  {project.initiative_classifications.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Начало</Label>
              <Input name="planned_start" type="date" className="bg-input-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Дедлайн</Label>
              <Input name="planned_end" type="date" className="bg-input-background border-border" />
            </div>
          </div>

          {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md p-2.5 border border-destructive/20">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Создаём..." : "Создать задачу"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
