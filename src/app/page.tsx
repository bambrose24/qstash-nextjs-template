import { HydrateClient } from "~/trpc/server";
import { AddToQueueCard } from "./_components/AddToQueueCard";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center p-6">
        <AddToQueueCard />
      </main>
    </HydrateClient>
  );
}
