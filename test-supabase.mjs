import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter(line => line.trim() && !line.trim().startsWith("#"))
    .map(line => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("GAGAL: URL atau publishable key tidak ditemukan.");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data, error } = await supabase
  .from("products")
  .select("id")
  .limit(1);

if (error) {
  console.error("Koneksi/API merespons dengan error:", error.message);
  console.error("Kode:", error.code ?? "tidak tersedia");
  process.exit(1);
}

console.log("Berhasil menghubungi Supabase dan membaca tabel products.");
console.log("Baris yang terbaca:", data.length);
