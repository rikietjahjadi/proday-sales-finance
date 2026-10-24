"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      alert("Logout gagal. Silakan coba lagi.");
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="fixed right-5 top-5 z-50 rounded-xl border border-[#F0C9DB] bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md hover:bg-[#FFF5F8] disabled:opacity-60"
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
