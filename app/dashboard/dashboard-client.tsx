"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase-browser";

type Profile = {
  full_name: string | null;
  role: string;
  is_active: boolean;
};

type DashboardStats = {
  products: number | null;
  productError: string | null;
};

const menu = [
  "Dashboard",
  "Penjualan",
  "Invoice & Piutang",
  "Pembayaran",
  "Produk",
  "Stok",
  "Partner",
  "Laporan",
];

export default function DashboardClient() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    products: null,
    productError: null,
  });
  const [status, setStatus] = useState("Menghubungkan ke Supabase...");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        setStatus("Sesi login tidak ditemukan. Silakan login kembali.");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("full_name, role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setStatus("Login berhasil, tetapi profil belum dapat dibaca.");
      } else if (!profileData || !profileData.is_active) {
        setStatus("Profil pengguna tidak ditemukan atau tidak aktif.");
      } else {
        setProfile(profileData as Profile);
        setStatus("Terhubung sebagai pengguna terautentikasi.");
      }

      const { count, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (cancelled) return;

      setStats({
        products: productsError ? null : count,
        productError: productsError
          ? "Data produk belum dapat dibaca sesuai izin akses."
          : null,
      });
    }

    loadDashboard().catch(() => {
      if (!cancelled) {
        setStatus("Terjadi kendala saat menghubungkan ke Supabase.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: "Total Penjualan",
      value: "Belum tersedia",
      detail: "Menunggu integrasi perhitungan transaksi",
      icon: "↗",
    },
    {
      title: "Invoice Belum Lunas",
      value: "Belum tersedia",
      detail: "Menunggu integrasi data invoice",
      icon: "▤",
    },
    {
      title: "Pembayaran Masuk",
      value: "Belum tersedia",
      detail: "Menunggu integrasi data pembayaran",
      icon: "▣",
    },
    {
      title: "Produk Aktif",
      value: stats.products === null ? "—" : String(stats.products),
      detail: stats.productError || "Jumlah produk yang dapat diakses akun ini",
      icon: "◇",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FDF7FB] text-slate-800 md:flex">
      <aside className="w-full shrink-0 bg-[#F3D8E9] p-5 md:min-h-screen md:w-64">
        <div className="mb-7 rounded-2xl bg-white p-4 text-center">
          <img
            src="/proday-logo.png"
            alt="PRODAY"
            className="mx-auto mb-2 h-auto max-h-16 max-w-full object-contain"
          />
          <p className="text-xs text-slate-600">Sales & Finance</p>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                activeMenu === item
                  ? "bg-white font-semibold text-[#D33F91] shadow-sm"
                  : "text-slate-700 hover:bg-white/70"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-[#E8B8D5] bg-white/40 p-3 text-sm">
          <p className="font-semibold">PRODAY Internal</p>
          <p className="mt-1 text-xs text-slate-600">Sales & Finance System</p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PRODAY / {activeMenu}</p>
            <h1 className="mt-2 text-3xl font-bold">{activeMenu}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sistem penjualan dan keuangan PRODAY.
            </p>
          </div>

          <div className="rounded-xl border border-[#F0D6E5] bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold">
              {profile?.full_name || "Pengguna PRODAY"}
            </p>
            <p className="text-slate-500">{profile?.role || "Memeriksa role..."}</p>
          </div>
        </header>

        <div
          role="status"
          className="mb-6 rounded-xl border border-[#F0D6E5] bg-white p-4 text-sm"
        >
          <p className="font-semibold">Status koneksi</p>
          <p className="mt-1 text-slate-600">{status}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#F0DDEA] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{card.title}</p>
                <span className="rounded-xl bg-[#FCE7F3] px-3 py-2 text-[#D33F91]">
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold">{card.value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {card.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-[#F0DDEA] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Penjualan Terbaru</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Data transaksi akan ditampilkan setelah integrasi tabel penjualan
              selesai dan izin aksesnya terverifikasi.
            </p>
            <button
              onClick={() => setActiveMenu("Penjualan")}
              className="mt-5 rounded-xl bg-[#D94F91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#BD3978]"
            >
              Buka Modul Penjualan
            </button>
          </section>

          <section className="rounded-2xl border border-[#F0DDEA] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Ringkasan Keuangan</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Ringkasan invoice, piutang, dan pembayaran akan ditampilkan
              setelah struktur data dan hak akses diverifikasi.
            </p>
            <button
              onClick={() => setActiveMenu("Invoice & Piutang")}
              className="mt-5 rounded-xl border border-[#E8A5C8] px-5 py-3 text-sm font-semibold text-[#D33F91] hover:bg-[#FDF2F8]"
            >
              Lihat Invoice & Piutang
            </button>
          </section>
        </div>

        <footer className="mt-10 text-xs text-slate-400">
          PRODAY Sales & Finance · Versi pengembangan
        </footer>
      </section>
    </main>
  );
}
