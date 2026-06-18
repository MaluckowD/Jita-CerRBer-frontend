import { useState } from "react";
import { useNavigate } from "react-router";
import { usersApi } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const token = await usersApi.login({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
      });
      await login(token);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const token = await usersApi.register({
        name: fd.get("name") as string,
        surname: fd.get("surname") as string,
        email: fd.get("email") as string,
        password: fd.get("password") as string,
      });
      await login(token);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10C4 6.69 6.69 4 10 4s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z" fill="white" opacity="0.3"/>
                <path d="M7 10c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z" fill="white"/>
                <path d="M2 5l3 3M2 15l3-3M18 5l-3 3M18 15l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xl tracking-tight text-foreground" style={{ fontFamily: "monospace" }}>
              CeRBeR<span className="text-primary">JIRA</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Система управления задачами</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl shadow-primary/5">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-sm transition-all",
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-input-background border-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Пароль</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="bg-input-background border-border" />
              </div>
              {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md p-2.5 border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Входим..." : "Войти"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Имя</Label>
                  <Input id="name" name="name" placeholder="Иван" required className="bg-input-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="surname" className="text-sm text-muted-foreground">Фамилия</Label>
                  <Input id="surname" name="surname" placeholder="Иванов" required className="bg-input-background border-border" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm text-muted-foreground">Email</Label>
                <Input id="reg-email" name="email" type="email" placeholder="you@example.com" required className="bg-input-background border-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm text-muted-foreground">Пароль</Label>
                <Input id="reg-password" name="password" type="password" placeholder="••••••••" required className="bg-input-background border-border" />
              </div>
              {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md p-2.5 border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
