import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";

export default async function OptionsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold">Options</h1>
      <p className="mt-2 text-gray-600">Coming soon.</p>
    </div>
  );
}
