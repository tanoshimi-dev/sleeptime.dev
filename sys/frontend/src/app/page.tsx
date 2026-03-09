import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen flex-col">
      <Header user={session.user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Welcome, {session.user.name || session.user.email}.
          </p>
        </main>
      </div>
    </div>
  );
}
