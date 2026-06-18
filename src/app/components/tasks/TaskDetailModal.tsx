import { useEffect, useState } from "react";
import { tasksApi } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import type {
  TaskWithDetailsResponse, ProjectInfoResponse,
  TaskUpdate, UserCommentResponse, TaskInfoResponse,
} from "../../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";
import {
  Trash2, ArrowRight, MessageSquare, Send, Pencil, Check, X,
  Calendar, Tag, Layers, User, Clock, UserCheck, UserX,
} from "lucide-react";
import { format } from "date-fns";

const priorityConfig = {
  LOW: { label: "Низкий", class: "text-emerald-700 bg-emerald-100 border-emerald-200" },
  MEDIUM: { label: "Средний", class: "text-amber-700 bg-amber-100 border-amber-200" },
  HIGH: { label: "Высокий", class: "text-red-700 bg-red-100 border-red-200" },
};

const stageConfig = {
  NEW: { label: "Новая", class: "text-slate-700 bg-slate-100 border-slate-200" },
  IN_PROGRESS: { label: "В работе", class: "text-amber-700 bg-amber-100 border-amber-200" },
  DONE: { label: "Готово", class: "text-emerald-700 bg-emerald-100 border-emerald-200" },
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  taskId: string;
  project: ProjectInfoResponse;
  onTaskUpdated: (t: TaskInfoResponse) => void;
  onTaskDeleted: (id: string) => void;
}

export function TaskDetailModal({ open, onOpenChange, taskId, project, onTaskUpdated, onTaskDeleted }: Props) {
  const { user } = useAuth();
  const [task, setTask] = useState<TaskWithDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [assigneeIdInput, setAssigneeIdInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    tasksApi.getById(taskId).then((t) => { setTask(t); setLoading(false); }).catch(() => setLoading(false));
  }, [open, taskId]);

  const applyUpdate = async (data: TaskUpdate) => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, data);
      setTask((t) => t ? { ...t, ...updated, project: t.project, comments: t.comments, reporter: t.reporter, assignee: t.assignee, component: t.component, initiative_classification: t.initiative_classification } : t);
      onTaskUpdated(updated);
    } catch {}
    setSaving(false);
    setEditingField(null);
  };

  const handleAssignToMe = async () => {
    if (!task || !user) return;
    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, { assignee_id: user.id });
      setTask((t) => t ? { ...t, ...updated, project: t.project, comments: t.comments, reporter: t.reporter, assignee: { id: user.id, name: user.name }, component: t.component, initiative_classification: t.initiative_classification } : t);
      onTaskUpdated(updated);
    } catch {}
    setSaving(false);
  };

  const handleClearAssignee = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, { assignee_id: null });
      setTask((t) => t ? { ...t, ...updated, project: t.project, comments: t.comments, reporter: t.reporter, assignee: null, component: t.component, initiative_classification: t.initiative_classification } : t);
      onTaskUpdated(updated);
    } catch {}
    setSaving(false);
  };

  const handleAssignById = async () => {
    if (!task || !assigneeIdInput.trim()) return;
    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, { assignee_id: assigneeIdInput.trim() });
      const details = await tasksApi.getById(task.id);
      setTask(details);
      setAssigneeIdInput("");
      onTaskUpdated(updated);
    } catch {}
    setSaving(false);
  };

  const handleNextStage = async () => {
    if (!task || task.stage === "DONE") return;
    setAdvancing(true);
    try {
      const updated = await tasksApi.nextStage(task.id);
      setTask((t) => t ? { ...t, stage: updated.stage } : t);
      onTaskUpdated(updated);
    } catch {}
    setAdvancing(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await tasksApi.delete(task.id);
      onTaskDeleted(task.id);
      onOpenChange(false);
    } catch {}
  };

  const handleSendComment = async () => {
    if (!task || !commentText.trim()) return;
    setSendingComment(true);
    try {
      const comment = await tasksApi.createComment(task.id, { text: commentText.trim() });
      setTask((t) => t ? { ...t, comments: [...t.comments, comment] } : t);
      setCommentText("");
    } catch {}
    setSendingComment(false);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!task) return;
    try {
      const updated = await tasksApi.updateComment(task.id, commentId, { text: editingCommentText });
      setTask((t) => t ? { ...t, comments: t.comments.map((c) => (c.id === commentId ? updated : c)) } : t);
      setEditingCommentId(null);
    } catch {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task) return;
    try {
      await tasksApi.deleteComment(task.id, commentId);
      setTask((t) => t ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) } : t);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogTitle className="sr-only">Детали задачи</DialogTitle>
        {loading || !task ? (
          <div className="flex items-center justify-center flex-1">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 px-5 pt-5 pb-3 pr-12 border-b border-border shrink-0">
              <span className="text-xs font-mono text-muted-foreground">{task.project.shortname}-{task.short_id}</span>
              <div className={cn("text-xs px-2 py-0.5 rounded border", stageConfig[task.stage].class)}>
                {stageConfig[task.stage].label}
              </div>
              <div className={cn("text-xs px-2 py-0.5 rounded border", priorityConfig[task.priority].class)}>
                {priorityConfig[task.priority].label}
              </div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
                {task.stage !== "DONE" && (
                  <Button size="sm" variant="outline" onClick={handleNextStage} disabled={advancing} className="h-7 gap-1.5 border-border text-xs">
                    <ArrowRight className="size-3" />
                    {task.stage === "NEW" ? "В работу" : "Завершить"}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-0 h-full">
                {/* Main content */}
                <div className="px-5 py-4 space-y-4 md:border-r border-border min-w-0">
                  {/* Title */}
                  {editingField === "name" ? (
                    <EditableField
                      defaultValue={task.name}
                      onSave={(v) => applyUpdate({ name: v })}
                      onCancel={() => setEditingField(null)}
                      multiline={false}
                    />
                  ) : (
                    <div className="group flex items-start gap-2 cursor-pointer min-w-0" onClick={() => setEditingField("name")}>
                      <h2 className="text-foreground leading-snug flex-1 min-w-0 break-words">{task.name}</h2>
                      <Pencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 shrink-0 transition-opacity" />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Описание</Label>
                    {editingField === "description" ? (
                      <EditableField
                        defaultValue={task.description}
                        onSave={(v) => applyUpdate({ description: v })}
                        onCancel={() => setEditingField(null)}
                        multiline
                      />
                    ) : (
                      <div
                        className="group cursor-pointer"
                        onClick={() => setEditingField("description")}
                      >
                        {task.description ? (
                          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed bg-muted rounded-lg p-3 border border-border group-hover:border-primary/30 transition-colors">
                            {task.description}
                          </pre>
                        ) : (
                          <p className="text-sm text-muted-foreground italic p-3 bg-muted rounded-lg border border-dashed border-border group-hover:border-primary/30 transition-colors">
                            Нажмите чтобы добавить описание...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border" />

                  {/* Comments */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="size-3.5 text-primary" />
                      <span className="text-sm text-foreground">Комментарии</span>
                      <span className="text-xs text-muted-foreground">({task.comments.length})</span>
                    </div>

                    <div className="space-y-3 mb-3">
                      {task.comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          isOwn={comment.user_id === user?.id}
                          editingId={editingCommentId}
                          editingText={editingCommentText}
                          onStartEdit={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }}
                          onEditChange={setEditingCommentText}
                          onSaveEdit={() => handleUpdateComment(comment.id)}
                          onCancelEdit={() => setEditingCommentId(null)}
                          onDelete={() => handleDeleteComment(comment.id)}
                        />
                      ))}
                    </div>

                    {/* New comment */}
                    <div className="flex gap-2 min-w-0">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Написать комментарий..."
                        rows={2}
                        className="bg-input-background border-border resize-none text-sm flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSendComment();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendComment}
                        disabled={sendingComment || !commentText.trim()}
                        className="shrink-0 self-end"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sidebar metadata */}
                <div className="px-4 py-4 space-y-4">
                  <MetaField
                    icon={<Calendar className="size-3.5" />}
                    label="Начало"
                    value={task.planned_start || "—"}
                    editing={editingField === "planned_start"}
                    onEdit={() => setEditingField("planned_start")}
                    type="date"
                    onSave={(v) => applyUpdate({ planned_start: v || null })}
                    onCancel={() => setEditingField(null)}
                  />
                  <MetaField
                    icon={<Clock className="size-3.5" />}
                    label="Дедлайн"
                    value={task.planned_end || "—"}
                    editing={editingField === "planned_end"}
                    onEdit={() => setEditingField("planned_end")}
                    type="date"
                    onSave={(v) => applyUpdate({ planned_end: v || null })}
                    onCancel={() => setEditingField(null)}
                  />

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="size-3" />Исполнитель
                    </Label>
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">{task.assignee?.name || "Не назначен"}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAssignToMe}
                          disabled={saving || task.assignee?.id === user?.id}
                          className="h-7 gap-1.5 border-border text-xs"
                        >
                          <UserCheck className="size-3" />
                          На меня
                        </Button>
                        {task.assignee && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleClearAssignee}
                            disabled={saving}
                            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <UserX className="size-3" />
                            Снять
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <Input
                          value={assigneeIdInput}
                          onChange={(e) => setAssigneeIdInput(e.target.value)}
                          placeholder="ID пользователя"
                          className="h-8 bg-input-background border-border text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAssignById}
                          disabled={saving || !assigneeIdInput.trim()}
                          className="h-8 px-2 text-xs"
                        >
                          OK
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="size-3" />Автор
                    </Label>
                    <p className="text-sm text-foreground">{task.reporter.name}</p>
                  </div>

                  {task.component && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Layers className="size-3" />Компонент
                      </Label>
                      <p className="text-sm text-foreground">{task.component.name}</p>
                    </div>
                  )}

                  {task.initiative_classification && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Tag className="size-3" />Тип инициативы
                      </Label>
                      <p className="text-sm text-foreground">{task.initiative_classification.name}</p>
                    </div>
                  )}

                  <Separator className="bg-border" />

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Создана</Label>
                    <p className="text-xs text-muted-foreground">{format(new Date(task.created_at), "dd.MM.yyyy HH:mm")}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Обновлена</Label>
                    <p className="text-xs text-muted-foreground">{format(new Date(task.updated_at), "dd.MM.yyyy HH:mm")}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditableField({
  defaultValue, onSave, onCancel, multiline,
}: {
  defaultValue: string;
  onSave: (v: string) => void;
  onCancel: () => void;
  multiline: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-1.5">
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          autoFocus
          className="bg-input-background border-border resize-none text-sm font-mono"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="bg-input-background border-border"
        />
      )}
      <div className="flex gap-1.5">
        <Button size="sm" className="h-6 px-2" onClick={() => onSave(value)}>
          <Check className="size-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2" onClick={onCancel}>
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function MetaField({
  icon, label, value, editing, onEdit, type, onSave, onCancel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  type: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [inputVal, setInputVal] = useState(value === "—" ? "" : value);
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}{label}
      </Label>
      {editing ? (
        <div className="flex gap-1 items-center">
          <Input
            type={type}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            autoFocus
            className="bg-input-background border-border h-7 text-xs"
          />
          <Button size="icon" className="size-7 shrink-0" onClick={() => onSave(inputVal)}><Check className="size-3" /></Button>
          <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={onCancel}><X className="size-3" /></Button>
        </div>
      ) : (
        <p
          className="text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={onEdit}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function CommentItem({
  comment, isOwn, editingId, editingText,
  onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onDelete,
}: {
  comment: UserCommentResponse;
  isOwn: boolean;
  editingId: string | null;
  editingText: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const isEditing = editingId === comment.id;
  return (
    <div className={cn("group", isOwn && "")}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[9px] text-primary shrink-0">
          U
        </div>
        <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), "dd.MM HH:mm")}</span>
        {isOwn && !isEditing && (
          <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onStartEdit} className="p-1 text-muted-foreground hover:text-foreground">
              <Pencil className="size-3" />
            </button>
            <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3" />
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-1.5 ml-7">
          <Textarea
            value={editingText}
            onChange={(e) => onEditChange(e.target.value)}
            rows={2}
            autoFocus
            className="bg-input-background border-border resize-none text-sm"
          />
          <div className="flex gap-1">
            <Button size="sm" className="h-6 px-2" onClick={onSaveEdit}><Check className="size-3" /></Button>
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={onCancelEdit}><X className="size-3" /></Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground/80 ml-7 leading-relaxed">{comment.text}</p>
      )}
    </div>
  );
}
