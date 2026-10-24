"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase-browser";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_type: string | null;
  stock_unit: string;
  is_active: boolean;
  created_at: string;
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    sku: "",
    product_name: "",
    product_type: "",
    stock_unit: "pcs",
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: queryError } = await supabase
      .from("products")
      .select("id, sku, product_name, product_type, stock_unit, is_active, created_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(
        `Data produk gagal dimuat: ${queryError.message}`
      );
      setProducts([]);
    } else {
      setProducts((data ?? []) as Product[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function addProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("products")
      .insert({
        sku: form.sku.trim(),
        product_name: form.product_name.trim(),
        product_type: ["FINISHED_GOOD", "PACKAGING", "OTHER"].includes(form.product_type) ? form.product_type : "FINISHED_GOOD",
        stock_unit: form.stock_unit.trim(),
        is_active: true,
      });

    if (insertError) {
      setMessage(`Produk gagal disimpan: ${insertError.message}`);
      setSaving(false);
      return;
    }

    setMessage("Produk berhasil ditambahkan.");
    setForm({
      sku: "",
      product_name: "",
      product_type: "",
      stock_unit: "pcs",
    });
    setShowForm(false);
    await loadProducts();
    setSaving(false);
  }

  async function toggleActive(product: Product) {
    setMessage("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (updateError) {
      setMessage(`Status gagal diubah: ${updateError.message}`);
      return;
    }

    setMessage(`Status produk ${product.sku} berhasil diperbarui.`);
    await loadProducts();
  }

  const filteredProducts = products.filter((product) => {
    const keyword = search.trim().toLowerCase();

    return (
      product.sku.toLowerCase().includes(keyword) ||
      product.product_name.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-[#FDF7FB] p-5 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">PRODAY / Dashboard / Produk</p>
            <h1 className="mt-2 text-3xl font-bold">Data Produk</h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola SKU, informasi produk, dan status produk PRODAY.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
            className="rounded-xl bg-[#D94F91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#BD3978]"
          >
            {showForm ? "Tutup Form" : "+ Tambah Produk"}
          </button>
        </header>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#F0D6E5] bg-white p-4 text-sm"
          >
            {message}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={addProduct}
            className="mb-6 rounded-2xl border border-[#F0DDEA] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-lg font-semibold">Tambah Produk Baru</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                SKU *
                <input
                  required
                  maxLength={100}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#D94F91]"
                  placeholder="Contoh: PRD-001"
                />
              </label>

              <label className="text-sm font-medium">
                Nama Produk *
                <input
                  required
                  maxLength={200}
                  value={form.product_name}
                  onChange={(e) =>
                    setForm({ ...form, product_name: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#D94F91]"
                  placeholder="Nama produk"
                />
              </label>

              <label className="text-sm font-medium">
                Jenis Produk
                <select
                  value={form.product_type}
                  onChange={(e) =>
                    setForm({ ...form, product_type: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#D94F91]"
                >
                  <option value="FINISHED_GOOD">Supplement Probiotik</option>
                  <option value="PACKAGING">Bahan Kemasan</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </label>

              <label className="text-sm font-medium">
                Satuan Stok *
                <input
                  required
                  value={form.stock_unit}
                  onChange={(e) =>
                    setForm({ ...form, stock_unit: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#D94F91]"
                  placeholder="pcs, box, sachet"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 rounded-xl bg-[#D94F91] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>
        )}

        <section className="rounded-2xl border border-[#F0DDEA] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Daftar Produk</h2>
              <p className="mt-1 text-sm text-slate-500">
                Total hasil: {filteredProducts.length} produk
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SKU atau nama produk..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D94F91] sm:max-w-sm"
            />
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Memuat data produk...
            </p>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Tidak ada produk yang ditemukan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="px-3 py-4 font-medium">SKU</th>
                    <th className="px-3 py-4 font-medium">Nama Produk</th>
                    <th className="px-3 py-4 font-medium">Jenis</th>
                    <th className="px-3 py-4 font-medium">Satuan</th>
                    <th className="px-3 py-4 font-medium">Status</th>
                    <th className="px-3 py-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-[#FDF7FB]"
                    >
                      <td className="px-3 py-4 font-medium">{product.sku}</td>
                      <td className="px-3 py-4">{product.product_name}</td>
                      <td className="px-3 py-4">
                        {product.product_type === "FINISHED_GOOD"
                          ? "Supplement Probiotik"
                          : product.product_type === "PACKAGING"
                          ? "Bahan Kemasan"
                          : product.product_type === "OTHER"
                          ? "Lainnya"
                          : "—"}
                      </td>
                      <td className="px-3 py-4">{product.stock_unit}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => void toggleActive(product)}
                          className="rounded-lg border border-[#E8A5C8] px-3 py-2 text-xs font-semibold text-[#D33F91] hover:bg-[#FDF2F8]"
                        >
                          {product.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-8 text-xs text-slate-400">
          PRODAY Sales & Finance · Modul Produk
        </footer>
      </div>
    </main>
  );
}
