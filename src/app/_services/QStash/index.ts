import superjson from "superjson";
import { Client as QStashClient } from "@upstash/qstash";
import { getLogger } from "~/app/_util/logger";
import {
  QUEUE_LOG_PREFIX,
  queuePayloads,
  queues,
  type ProcessResponse,
  type Queue,
  type QueuePayloads,
} from "./types";

function getWebhookURL() {
  const baseURL = process.env.QSTASH_WEBHOOK_URL ?? "http:localhost:3000";
  return `${baseURL}/api/qstash/handle`;
}

const qstashClient = new QStashClient({
  token: process.env.QSTASH_TOKEN ?? "",
});

const handlers = {
  "process-post": async (data) => {
    getLogger().info(`${QUEUE_LOG_PREFIX} Processing post`, {
      postId: data.postId,
    });
    return {
      success: true,
      message: "Post processed",
    };
  },
} as const satisfies {
  [k in Queue]: (data: QueuePayloads[k]) => Promise<ProcessResponse>;
};

export const QueueService = {
  async publish<TQueue extends Queue>({
    queue: queueName,
    data,
  }: {
    queue: TQueue;
    data: Omit<QueuePayloads[TQueue], "queue">;
  }) {
    const payload = superjson.stringify(data);
    try {
      getLogger().debug(`${QUEUE_LOG_PREFIX} Publishing message`, {
        queue: queueName,
        payload,
      });

      // Create the queue reference
      const queue = qstashClient.queue({
        queueName, // The name of the queue
      });

      // Publish to the queue
      const response = await queue.enqueue({
        url: getWebhookURL(),
        body: superjson.stringify({ ...data, queue: queueName }), // The data to be sent - using superjson to be more flexible
      });

      // Handle the response as needed
      getLogger().debug(`${QUEUE_LOG_PREFIX} Message published successfully`, {
        messageId: response.messageId,
        queue: queueName,
        payload,
      });
    } catch (error) {
      // Handle any errors
      getLogger().error(`${QUEUE_LOG_PREFIX} Failed to publish message`, {
        queue: queueName,
        payload,
        error,
      });
      throw error;
    }
  },

  process: async (payload: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const queueParsed = queues.safeParse((payload as any)?.queue);
    if (queueParsed.error) {
      getLogger().error(`${QUEUE_LOG_PREFIX} invalid queue from payload`, {
        payload,
      });
      throw queueParsed.error;
    }
    const queue = queueParsed.data;

    getLogger().debug(
      `${QUEUE_LOG_PREFIX} Processing a message for this queue`,
      {
        queue,
        payload,
      },
    );

    const handler = handlers[queue] as (
      data: QueuePayloads[typeof queue],
    ) => Promise<ProcessResponse>;

    if (!handler) {
      getLogger().error(`${QUEUE_LOG_PREFIX} no handler for queue`, {
        queue,
        payload,
      });
      throw new Error(`No handler for queue ${queue}`);
    }

    const parsedPayload = queuePayloads[queue].safeParse(payload);
    if (!parsedPayload.success) {
      getLogger().error(`${QUEUE_LOG_PREFIX} invalid payload for queue`, {
        queue,
        payload,
        error: parsedPayload.error,
      });
      throw parsedPayload.error;
    }

    const response = await handler(parsedPayload.data);

    getLogger().debug(`${QUEUE_LOG_PREFIX} Processed message`, {
      success: response.success,
      message: response.message,
      queue,
      payload,
    });

    return { response, queue };
  },
};
export { QUEUE_LOG_PREFIX };
