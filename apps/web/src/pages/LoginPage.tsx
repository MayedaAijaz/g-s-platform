import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gsmedcure.demo");
  const [password, setPassword] = useState("Admin@1234!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Demo notice */}
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ <strong>Demo Application</strong> — All data is synthetic. Not connected to any real
          manufacturing system.
        </div>

        <div className="card p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
              GS
            </div>
            <h1 className="text-xl font-semibold text-gray-900">GS Medcure</h1>
            <p className="text-sm text-gray-500 mt-1">
              Digital Manufacturing Intelligence Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Demo credentials:</p>
            <div className="space-y-1 text-xs text-gray-600 font-mono">
              <div>admin@gsmedcure.demo / Admin@1234!</div>
              <div>qc.manager@gsmedcure.demo / User@1234!</div>
              <div>prod.manager@gsmedcure.demo / User@1234!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
