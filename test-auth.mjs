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

console.log("Tes ini memerlukan sesi login browser, jadi tidak memakai API key saja.");
console.log("File konfigurasi tersedia:", Boolean(env.NEXT_PUBLIC_SUPABASE_URL));
console.log("Lanjutkan dengan pengujian dari aplikasi setelah sesi login terhubung.");
