import superjson from "superjson";

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { QUEUE_LOG_PREFIX, QueueService } from "~/app/_services/QStash";
import { getLogger } from "~/app/_util/logger";

async function handler(request: Request) {
  getLogger().info(
    `${QUEUE_LOG_PREFIX} Received verified qstash message request`,
  );

  const dataText = await request.text();

  const payload = superjson.parse(dataText);

  try {
    const { response: handlerResponse, queue } =
      await QueueService.process(payload);

    if (handlerResponse.success) {
      getLogger().info(
        `${QUEUE_LOG_PREFIX} Successfully processed qstash message`,
        { queue, payload: dataText },
      );
      return Response.json({
        success: handlerResponse.success,
        message: handlerResponse.message,
      });
    } else {
      const message = `${QUEUE_LOG_PREFIX} Failed to process qstash message`;
      getLogger().error(message, {
        queue,
        message: handlerResponse.message,
        payload: dataText,
      });
      return getErrorResponse(handlerResponse.message);
    }
  } catch (e) {
    const errorLogMessage = `${QUEUE_LOG_PREFIX} The queue handler service threw an error processing a qstash message: ${e}`;
    getLogger().error(errorLogMessage, {
      payload: dataText,
    });
    return getErrorResponse(errorLogMessage);
  }
}

function getErrorResponse(message: string) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
    }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}

/**
 * This helper is a higher-order-function that verifies the signature of the incoming request using QStash's signature header.
 *
 * It requires QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY to be set
 */
export const POST = verifySignatureAppRouter(handler);
