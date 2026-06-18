import { useState } from "react";
import { projectsApi } from "../../../lib/api";
import type { ProjectInfoResponse, ProjectComponent, ProjectInitiativeClassification } from "../../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Plus, Pencil, Trash2, Layers, Tag, FileText } from "lucide-react";

interface Props {
  project: ProjectInfoResponse;
  onProjectUpdated: (p: ProjectInfoResponse) => void;
}

export function ProjectSettingsTab({ project, onProjectUpdated }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const updated = await projectsApi.update(project.id, {
        name: fd.get("name") as string,
        shortname: fd.get("shortname") as string,
        description: (fd.get("description") as string) || null,
        task_description_template: (fd.get("template") as string) || null,
      });
      onProjectUpdated(updated);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl space-y-8">
      {/* General */}
      <section>
        <h3 className="text-foreground mb-4 flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Общие настройки
        </h3>
        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Название</Label>
              <Input name="name" defaultValue={project.name} className="bg-input-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Ключ проекта</Label>
              <Input name="shortname" defaultValue={project.shortname} className="bg-input-background border-border uppercase" maxLength={6} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Описание</Label>
            <Textarea name="description" defaultValue={project.description ?? ""} rows={2} className="bg-input-background border-border resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">Шаблон описания задачи</Label>
            <Textarea name="template" defaultValue={project.task_description_template ?? ""} rows={4} className="bg-input-background border-border resize-none font-mono text-sm" placeholder="## Описание&#10;&#10;## Критерии приёмки&#10;" />
          </div>
          <Button type="submit" size="sm" disabled={saving}>{saving ? "Сохраняем..." : "Сохранить"}</Button>
        </form>
      </section>

      <Separator className="bg-border" />

      {/* Components */}
      <ComponentsSection project={project} onProjectUpdated={onProjectUpdated} />

      <Separator className="bg-border" />

      {/* Initiative Classifications */}
      <ClassificationsSection project={project} onProjectUpdated={onProjectUpdated} />
    </div>
  );
}

function ComponentsSection({ project, onProjectUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectComponent | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      let updated: ProjectInfoResponse;
      if (editing) {
        updated = await projectsApi.updateComponent(project.id, editing.id, {
          name: fd.get("name") as string,
          description: fd.get("description") as string,
        });
      } else {
        updated = await projectsApi.createComponent(project.id, {
          name: fd.get("name") as string,
          description: fd.get("description") as string,
        });
      }
      onProjectUpdated(updated);
      setOpen(false);
      setEditing(null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (componentId: string) => {
    try {
      await projectsApi.deleteComponent(project.id, componentId);
      onProjectUpdated({ ...project, components: project.components.filter((c) => c.id !== componentId) });
    } catch {}
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          Компоненты
        </h3>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5 border-border h-7 text-xs">
          <Plus className="size-3" />Добавить
        </Button>
      </div>
      <div className="space-y-1.5">
        {project.components.length === 0 && (
          <p className="text-muted-foreground text-sm py-2">Нет компонентов</p>
        )}
        {project.components.map((c) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border group">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="size-6" onClick={() => { setEditing(c); setOpen(true); }}>
                <Pencil className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="bg-popover border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Изменить компонент" : "Новый компонент"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Название</Label>
              <Input name="name" defaultValue={editing?.name} className="bg-input-background border-border" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Описание</Label>
              <Input name="description" defaultValue={editing?.description ?? ""} className="bg-input-background border-border" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Отмена</Button>
              <Button type="submit" disabled={saving}>{saving ? "..." : editing ? "Сохранить" : "Создать"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ClassificationsSection({ project, onProjectUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectInitiativeClassification | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      let updated: ProjectInfoResponse;
      if (editing) {
        updated = await projectsApi.updateInitiativeClassification(project.id, editing.id, {
          name: fd.get("name") as string,
          description: fd.get("description") as string,
        });
      } else {
        updated = await projectsApi.createInitiativeClassification(project.id, {
          name: fd.get("name") as string,
          description: fd.get("description") as string,
        });
      }
      onProjectUpdated(updated);
      setOpen(false);
      setEditing(null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await projectsApi.deleteInitiativeClassification(project.id, id);
      onProjectUpdated({
        ...project,
        initiative_classifications: project.initiative_classifications.filter((c) => c.id !== id),
      });
    } catch {}
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          Типы инициатив
        </h3>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5 border-border h-7 text-xs">
          <Plus className="size-3" />Добавить
        </Button>
      </div>
      <div className="space-y-1.5">
        {project.initiative_classifications.length === 0 && (
          <p className="text-muted-foreground text-sm py-2">Нет типов инициатив</p>
        )}
        {project.initiative_classifications.map((c) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border group">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="size-6" onClick={() => { setEditing(c); setOpen(true); }}>
                <Pencil className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="bg-popover border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editing ? "Изменить тип" : "Новый тип инициативы"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Название</Label>
              <Input name="name" defaultValue={editing?.name} className="bg-input-background border-border" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Описание</Label>
              <Input name="description" defaultValue={editing?.description ?? ""} className="bg-input-background border-border" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">Отмена</Button>
              <Button type="submit" disabled={saving}>{saving ? "..." : editing ? "Сохранить" : "Создать"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
