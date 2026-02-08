import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { getSession } from "@/lib/auth/auth";
import {
  BoardScope,
  createBoardAction,
  deleteBoardAction,
  listBoardsForUser,
  renameBoardAction,
  toggleBoardPrivacyAction,
} from "@/lib/actions/boards";

type Props = {
  searchParams?: Promise<{
    q?: string;
    scope?: BoardScope | string;
  }>;
};

async function BoardsPageInner({ searchParams }: Props) {
  noStore();

  const session = await getSession();
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  // ✅ unwrap Promise searchParams (required by your Next config/runtime)
  const sp = (await searchParams) ?? {};
  const q = sp.q ?? "";
  const scope: BoardScope = sp.scope === "all" ? "all" : "my";

  const boards = await listBoardsForUser({ userId, scope, q });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Boards</h1>
          </div>

          {/* Create */}
          <form
            action={async (formData) => {
              "use server";
              await createBoardAction(formData, userId);
            }}
            className="flex gap-2"
          >
            <input
              name="name"
              placeholder='Board name (e.g. "New custom page")'
              className="w-72 rounded-md border px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              Create
            </button>
          </form>
        </div>

        {/* Search + scope filter */}
        <form
          method="GET"
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex gap-2">
            <button
              type="submit"
              name="scope"
              value="my"
              className={[
                "rounded-md border px-3 py-2 text-sm",
                scope === "my" ? "bg-gray-100" : "hover:bg-gray-50",
              ].join(" ")}
            >
              My Boards
            </button>
            <button
              type="submit"
              name="scope"
              value="all"
              className={[
                "rounded-md border px-3 py-2 text-sm",
                scope === "all" ? "bg-gray-100" : "hover:bg-gray-50",
              ].join(" ")}
            >
              All Boards
            </button>
          </div>

          <input
            name="q"
            defaultValue={q}
            placeholder="Search boards by name…"
            className="w-full sm:w-96 rounded-md border px-3 py-2 text-sm"
          />

          {/* Preserve scope when searching */}
          <input type="hidden" name="scope" value={scope} />

          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            Search
          </button>

          {(q || scope === "all") && (
            <Link href="/boards" className="text-sm text-gray-600 underline">
              Reset
            </Link>
          )}
        </form>

        {/* List */}
        <div className="space-y-3">
          {boards.length === 0 ? (
            <div className="rounded-lg border p-6 text-gray-600">
              No boards found.
            </div>
          ) : (
            boards.map((b) => (
              <div key={b._id} className="rounded-lg border bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-black truncate">
                        {b.name}
                      </div>

                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[11px] border",
                          b.isPrivate ? "bg-white" : "bg-gray-50",
                        ].join(" ")}
                        title={b.isPrivate ? "Private" : "Public"}
                      >
                        {b.isPrivate ? "Private" : "Public"}
                      </span>

                      {!b.isMine && (
                        <span className="rounded-full px-2 py-0.5 text-[11px] border bg-gray-50">
                          Shared
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {b.updatedAt
                        ? `Last edit: ${new Date(b.updatedAt).toLocaleString()}`
                        : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/boards/${b._id}`}
                      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Open
                    </Link>

                    {b.isMine ? (
                      <>
                        <form
                          action={async (formData) => {
                            "use server";
                            await toggleBoardPrivacyAction(formData, userId);
                          }}
                          className="flex items-center gap-2 rounded-md border px-3 py-2"
                          title="Toggle board visibility"
                        >
                          <input type="hidden" name="boardId" value={b._id} />
                          <input
                            type="hidden"
                            name="isPrivate"
                            value={String(!b.isPrivate)}
                          />
                          <button type="submit" className="text-sm">
                            Make {b.isPrivate ? "Public" : "Private"}
                          </button>
                        </form>

                        <form
                          action={async (formData) => {
                            "use server";
                            await renameBoardAction(formData, userId);
                          }}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="boardId" value={b._id} />
                          <input
                            name="name"
                            defaultValue={b.name}
                            className="w-44 rounded-md border px-3 py-2 text-sm"
                          />
                          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                            Rename
                          </button>
                        </form>

                        <form
                          action={async (formData) => {
                            "use server";
                            await deleteBoardAction(formData, userId);
                          }}
                        >
                          <input type="hidden" name="boardId" value={b._id} />
                          <button className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">
                            Delete
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardsPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BoardsPageInner {...props} />
    </Suspense>
  );
}
