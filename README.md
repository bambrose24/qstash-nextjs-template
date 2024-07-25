# QStash NextJS publisher and handler

This template shows you how to build a QStash queue handler, and provides a simple type-safe wrapper to build and publish messages to queues.

The way Upstash's QStash works is that it lets you publish to a queue, then QStash will handle sending that payload to a specified URL of your choosing. This is then part of the request payload. We use Next.js as the backend here to process the messages, as well as provide an example of how to publish a message to a queue. Everything is serialized/deserialized with SuperJSON, and validated with zod.

The result is that you only have to build out a `handler` that lets you process a message, and you get the rest for free. You specify the payload you're expecting, and you'll get a type-safe async function to do your work in processing the message.

This project was initialized with [T3 Stack](https://create.t3.gg/) bootstrapped with `create-t3-app`. Please read more about their documentation and generally about Next.js if you're curious.

## Quick Start

1. Create a project on Upstash and associate all of the correct variables.
2. Create a Queue in the QStash tab with the name of the queue(s) in `src/app/_services/QStash/types.ts`. If you want to see messages immediately, create a queue named `process-post` so you can test it out.
3. Open the home page of the deployed Next.js app and click the button. You should see that the message shows up in QStash, then you should see logs in your deployment logs for processing the message.

You can now extend this to handle all of your background work super simply. No more setup required!
