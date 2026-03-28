import React, { useState } from "react";
import { signUpWithEmail } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { GraduationCap, HelpCircle } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface DashboardHeaderProps {
  activeNav: "application" | "settings";
  onNavChange: (nav: "application" | "settings") => void;
  setUserEmail?: (email: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
  const { activeNav, onNavChange, setUserEmail } = props;
  // Состояния для email, password и статуса
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regStatus, setRegStatus] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Проверка сессии при загрузке
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setUserEmail?.(data.user.email);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserEmail?.(session?.user?.email || "");
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Обработчик регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);
    try {
      const user = await signUpWithEmail(email, password);
      setRegStatus("Регистрация успешна!");
      setUser(user);
      setDialogOpen(false);
      console.log("Регистрация успешна:", user);
    } catch (err: any) {
      setRegStatus(err.message || "Ошибка регистрации");
      console.error("Ошибка регистрации:", err);
    }
  };

  // Обработчик входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      setRegStatus("Вход успешен!");
      setDialogOpen(false);
    } catch (err: any) {
      setRegStatus(err.message || "Ошибка входа");
    }
  };

  // Обработчик выхода
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">InVision U</span>
          </div>
          <nav className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onNavChange("application")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeNav === "application" ? "tab-active" : "tab-inactive"
              }`}
            >
              Заявка
            </button>
            <button
              onClick={() => onNavChange("settings")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeNav === "settings" ? "tab-active" : "tab-inactive"
              }`}
            >
              Настройки
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-4 w-4" />
            Поддержка
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md text-xs font-medium bg-muted text-foreground border border-border hover:brightness-110 transition-all"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all tab-active shadow-sm bg-primary text-primary-foreground hover:brightness-110"
                >
                  Регистрация или вход
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Регистрация или вход</DialogTitle>
                  <DialogDescription>Введите email и пароль</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium mb-1">Пароль</label>
                    <input
                      id="register-password"
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  {regStatus && (
                    <div className="text-sm text-center text-destructive font-medium">{regStatus}</div>
                  )}
                  <DialogFooter className="flex flex-col gap-2">
                    {mode === 'register' ? (
                      <>
                        <button
                          type="submit"
                          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                        >
                          Зарегистрироваться
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-md bg-muted px-4 py-2 text-sm font-semibold text-foreground border border-border hover:brightness-110 transition-all"
                          onClick={() => setMode('login')}
                        >
                          Уже есть аккаунт? Войти
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="submit"
                          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                        >
                          Войти
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-md bg-muted px-4 py-2 text-sm font-semibold text-foreground border border-border hover:brightness-110 transition-all"
                          onClick={() => setMode('register')}
                        >
                          Нет аккаунта? Зарегистрироваться
                        </button>
                      </>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
