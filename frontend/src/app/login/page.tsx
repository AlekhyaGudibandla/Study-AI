"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : (err.message || "Login failed. Check your credentials.");
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface p-4">
      <div className="w-full max-w-md bg-surface-variant p-8 rounded-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-manrope text-primary">The Sanctuary</h1>
          <p className="text-on-surface-variant opacity-70">Welcome back to your digital atelier</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
