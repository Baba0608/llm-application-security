import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "../logout-button";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Chat
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {session.sub}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-zinc-600 dark:text-zinc-400">
          Chat UI can go here. You’re signed in as {session.sub}.
        </p>
      </main>
    </div>
  );
}
