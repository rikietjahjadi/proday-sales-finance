"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError("Login gagal. Periksa email dan password Anda.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Masukkan alamat email akun Anda terlebih dahulu.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      setError(
        "Permintaan reset password gagal. " + error.message
      );
      return;
    }

    setMessage(
      "Jika email terdaftar, tautan pemulihan akan dikirim. Periksa inbox dan folder spam."
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFF5F8] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#F8DDEA] bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img
            src="/proday-logo.png"
            alt="PRODAY"
            className="mx-auto mb-6 h-auto max-h-20 max-w-[200px] object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800">
            PRODAY Sales & Finance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {resetMode
              ? "Minta tautan untuk membuat password baru"
              : "Masuk untuk melanjutkan ke dashboard"}
          </p>
        </div>

        <form
          onSubmit={resetMode ? handleResetPassword : handleLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#E8D5DF] px-4 py-3 outline-none focus:border-[#D979A4] focus:ring-2 focus:ring-[#F8DDEA]"
              placeholder="nama@email.com"
            />
          </div>

          {!resetMode && (
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#E8D5DF] px-4 py-3 outline-none focus:border-[#D979A4] focus:ring-2 focus:ring-[#F8DDEA]"
                placeholder="Masukkan password"
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl bg-green-50 p-3 text-sm text-green-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#D979A4] px-4 py-3 font-semibold text-white transition hover:bg-[#C65F8D] disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : resetMode
                ? "Kirim Tautan Reset"
                : "Masuk"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setResetMode(!resetMode);
              setError("");
              setMessage("");
            }}
            className="font-medium text-[#C65F8D] hover:underline"
          >
            {resetMode ? "Kembali ke login" : "Lupa Password?"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Akses hanya untuk pengguna yang terdaftar.
        </p>
      </section>
    </main>
  );
}
