import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "../components/Dashboard";
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  console.log(session);
  if (!session) {
    redirect("/login");
  }

  return <Dashboard />;
}
