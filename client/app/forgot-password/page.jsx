"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { authService } from "../../src/services/authService"; // adjust path to match your project


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [error, setError] = useState("");

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("loading");
  setError("");

  try {
    await authService.forgotPassword(email);
    setStatus("sent");
  } catch (err) {
    setError(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setStatus("error");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            We'll email you a link to reset it
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {status === "sent" ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-3 py-2">
              If an account exists for {email}, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-slate-900 text-white text-sm font-medium rounded-md py-2 hover:bg-slate-800 transition disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Remembered it?{" "}
          <Link href="/login" className="text-slate-900 font-medium underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}