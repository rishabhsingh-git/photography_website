import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../ui/primitives/Button";
import { Input } from "../../ui/primitives/Input";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { useToastStore } from "../../ui/primitives/ToastStore";

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const { add } = useToastStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await login(email, password, remember);
    } catch (err: any) {
      add({
        title: "Login failed",
        description: err?.response?.data?.message ?? "Please check credentials",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_top,_#0ea5e9_0,_transparent_35%),radial-gradient(circle_at_20%_20%,_#ec4899_0,_transparent_25%)] bg-slate-950">
      <Card className="w-full max-w-lg shadow-2xl border-slate-800/70 bg-slate-950/80">
        <CardHeader>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Access</p>
            <h1 className="text-2xl font-semibold text-slate-50">Sign in to Studio Control</h1>
            <p className="text-sm text-slate-400">
              Manage bookings, assets, payments, and categories securely.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                Remember me
              </label>
              <span className="text-slate-500">Secure session</span>
            </div>
            <Button type="submit" block size="lg" loading={loading || submitting}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;


