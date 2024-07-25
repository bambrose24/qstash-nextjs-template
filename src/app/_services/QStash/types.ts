import { z } from "zod";

/**
 * To create a queue, simply add to the {@link queues} list below, then create a payload type, and then create a handler.
 *
 * When you add to the queues list below, you just need to fix the typescript errors, then you'll be able to process and send messages.
 */

export const queues = z.enum(["process-post"]);
export type Queue = z.infer<typeof queues>;

const baseQueueSchema = z.object({
  queue: queues,
});

export const queuePayloads = {
  "process-post": baseQueueSchema.extend({
    queue: z.literal("process-post"),
    postId: z.number().int(), // id in vp_weekly_update db row to send to google sheets
  }),
} as const satisfies Record<
  Queue,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  z.ZodObject<{ queue: z.ZodLiteral<Queue> }, any>
>;

export type QueuePayloads = {
  [K in keyof typeof queuePayloads]: z.infer<(typeof queuePayloads)[K]>;
};

export const QUEUE_LOG_PREFIX = "[qstash]";

export type ProcessResponse = {
  success: boolean;
  message: string;
};
