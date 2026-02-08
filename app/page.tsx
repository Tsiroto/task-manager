import ImageTabs from "@/components/image-tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";

export default async function Home() {
  const session = await getSession();

  // ✅ If logged-in, never show marketing homepage
  if (session?.user) {
    redirect("/dashboard");
  }

  // ✅ Signed-out marketing homepage (your original)
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <section className="container mx-auto px-4 py-32">
          <h1 className="text-6xl font-bold">LiFO Commercial</h1>
          <p className="mt-3 text-2xl text-gray-700">
            Capture, organize, and manage your business data efficiently.
          </p>
          <div className="mt-8">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="h-12 px-8 text-lg font-medium bg-red-500 cursor-pointer"
              >
                Start here <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <ImageTabs />

        <section className="border-t bg-white py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-black">
                  Organize Campaigns
                </h3>
                <p className="text-muted-foreground">
                  Create structured projects and deliverables to manage branded
                  content, articles, social posts, and newsletters in one place.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-black">
                  Track Production Flow
                </h3>
                <p className="text-muted-foreground">
                  Follow each deliverable from brief to approval to publication
                  with clear statuses and visual workflow boards.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-black">
                  Stay in Control
                </h3>
                <p className="text-muted-foreground">
                  Keep deadlines, client approvals, assets, and notes
                  centralized so nothing gets lost between teams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
