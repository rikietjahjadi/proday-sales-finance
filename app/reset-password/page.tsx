"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeRecovery() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hash = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
      );

      const recoveryError =
        hash.get("error_description") || hash.get("error");

      if (recoveryError) {
        if (mounted) {
          setError(
            "Tautan pemulihan tidak valid atau sudah kedaluwarsa. Jangan gunakan tautan lama."
          );
        }
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (mounted) {
            setError(
              "Tautan pemulihan tidak dapat diverifikasi. Tautan mungkin sudah kedaluwarsa."
            );
          }
          return;
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });

        if (error) {
          if (mounted) {
            setError(
              "Sesi pemulihan tidak valid atau sudah kedaluwarsa."
            );
          }
          return;
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setError(
          "Sesi pemulihan tidak ditemukan. Gunakan tautan reset password terbaru dari email."
        );
        return;
      }

      setReady(true);
    }

    initializeRecovery();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password harus terdiri dari minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("Password gagal diperbarui: " + error.message);
      return;
    }

    await supabase.auth.signOut();
    setReady(false);
    setMessage(
      "Password berhasil diperbarui. Silakan kembali ke halaman login dan masuk dengan password baru."
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
            Buat Password Baru
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masukkan password baru untuk akun Proday Sales & Finance.
          </p>
        </div>

        {ready && (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password baru
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#E8D5DF] px-4 py-3 outline-none focus:border-[#D979A4] focus:ring-2 focus:ring-[#F8DDEA]"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Konfirmasi password baru
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="w-full rounded-xl border border-[#E8D5DF] px-4 py-3 outline-none focus:border-[#D979A4] focus:ring-2 focus:ring-[#F8DDEA]"
                placeholder="Masukkan ulang password"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#D979A4] px-4 py-3 font-semibold text-white transition hover:bg-[#C65F8D] disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>
        )}

        {error && !ready && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {(message || !ready) && (
          <a
            href="/login"
            className="mt-4 block text-center text-sm font-medium text-[#C65F8D] hover:underline"
          >
            Kembali ke halaman login
          </a>
        )}
      </section>
    </main>
  );
}
