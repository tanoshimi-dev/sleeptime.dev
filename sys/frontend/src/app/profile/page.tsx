import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { user } = session;

  return (
    <div className="flex h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name || "Avatar"}
                  className="h-16 w-16 rounded-full"
                />
              )}
              <div>
                <p className="text-lg font-medium">{user.name}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>
            <ProfileForm user={user} />
          </div>
        </main>
      </div>
    </div>
  );
}
