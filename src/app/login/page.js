"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { AuthService } from "../services/api";
import Toast from "../components/Toast";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    try {
      const data = await AuthService.login(form.email, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      window.location.href = "/";
    } catch (err) {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <img src="https://flowbee.io/images/logo.png" alt="Flowbee Logo" className="h-10 object-contain mb-6" />
          <h1 className="text-2xl font-light text-text-primary tracking-wide">Welcome Back</h1>
          <p className="text-sm text-text-muted mt-2 text-center max-w-sm">
            Sign in to the Flowbee Campaign Scheduler dashboard to manage your automated workflows.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-elevated border border-border-subtle rounded-2xl p-8 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary tracking-wider uppercase ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@flowbee.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary tracking-wider uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border-subtle bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 mt-4 text-sm text-black font-semibold tracking-wider uppercase transition-all hover:bg-accent-hover disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
