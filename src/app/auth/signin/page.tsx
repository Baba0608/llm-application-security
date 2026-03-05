import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/chat/secure");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Sign in
      </h1>
      <SignInForm />
    </div>
  );
}
