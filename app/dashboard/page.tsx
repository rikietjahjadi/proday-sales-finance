import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import DashboardClient from "./dashboard-client";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <LogoutButton />
      <DashboardClient />
    </>
  );
}
