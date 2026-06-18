import { useState } from "react";
import { usersApi } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { cn } from "../ui/utils";
import { User, Mail, Shield, Briefcase, Check } from "lucide-react";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    try {
      await usersApi.editMe({
        name: fd.get("name") as string,
        surname: fd.get("surname") as string,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-foreground">Профиль</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Управление вашим аккаунтом</p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl text-primary">
          {user.name[0]}{user.surname[0]}
        </div>
        <div>
          <p className="text-foreground">{user.name} {user.surname}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <span className={cn("text-xs px-2 py-0.5 rounded mt-1 inline-block",
            user.role === "admin" ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-secondary-foreground border border-border"
          )}>
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground text-sm mb-4 flex items-center gap-2">
          <User className="size-4 text-primary" />
          Личные данные
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Имя</Label>
              <Input name="name" defaultValue={user.name} className="bg-input-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-sm">Фамилия</Label>
              <Input name="surname" defaultValue={user.surname} className="bg-input-background border-border" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm flex items-center gap-1">
              <Mail className="size-3" />Email (нельзя изменить)
            </Label>
            <Input value={user.email} disabled className="bg-input-background border-border opacity-60" />
          </div>
          {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md p-2.5 border border-destructive/20">{error}</p>}
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            {saved ? <><Check className="size-3.5" />Сохранено!</> : saving ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </form>
      </div>

      {/* Projects membership */}
      {user.projects.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-foreground text-sm mb-4 flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            Участие в проектах
          </h3>
          <div className="space-y-2">
            {user.projects.map(({ project, role, member_from }) => (
              <div key={project.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted border border-border">
                <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-primary font-mono">{project.name.slice(0, 3).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">с {new Date(member_from).toLocaleDateString("ru")}</p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded border",
                  role === "LEAD"
                    ? "bg-primary/15 text-primary border-primary/25"
                    : "bg-secondary text-secondary-foreground border-border",
                )}>
                  {role === "LEAD" ? "Лид" : "Участник"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
