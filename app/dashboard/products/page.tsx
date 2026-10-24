import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ProductsClient />;
}
