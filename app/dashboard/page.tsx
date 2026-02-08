import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";

function DisabledCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border p-5 opacity-60 cursor-not-allowed select-none bg-white">
      <div className="text-lg font-semibold text-black">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
      <div className="mt-3 text-xs text-gray-500">Coming soon</div>
    </div>
  );
}

export default async function DashboardHome() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600">Choose where you want to go.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/boards"
            className="rounded-lg border p-5 hover:bg-gray-50 transition"
          >
            <div className="text-lg font-semibold text-black">Boards</div>
            <div className="mt-1 text-sm text-gray-600">
              View and manage boards.
            </div>
          </Link>

          <DisabledCard
            title="Users"
            desc="Roles + invitations will live here."
          />

          <DisabledCard
            title="Options"
            desc="App settings and preferences."
          />
        </div>
      </div>
    </div>
  );
}
