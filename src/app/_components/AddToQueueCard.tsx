"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { api } from "~/trpc/react";

export function AddToQueueCard() {
  const { mutateAsync: addToQueue, isPending } =
    api.post.addToQueue.useMutation();
  return (
    <Card className="max-w-[400px]">
      <CardHeader>
        <CardTitle>Add to queue</CardTitle>
        <CardDescription>
          Clicking this button adds a job to the queue. See your logs to see it
          get processed. It will only get processed when deployed.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isPending}
          onClick={async () => {
            await addToQueue();
            toast.success(
              `Added to queue. Check QStash and your deployment logs to see it get processed.`,
            );
          }}
        >
          Add to Queue
        </Button>
      </CardFooter>
    </Card>
  );
}
