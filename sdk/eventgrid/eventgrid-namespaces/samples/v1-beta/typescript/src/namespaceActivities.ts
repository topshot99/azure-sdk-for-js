// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @summary Publish and Receive events to Event Grid.
 */

import { EventGridClient, CloudEvent, ReceiveResult } from "@azure/eventgrid-namespaces";
import { AzureKeyCredential } from "@azure/core-auth";

import "dotenv/config";

// Load the .env file if it exists
const endpoint = process.env["EVENT_GRID_NAMESPACES_ENDPOINT"] ?? "https://endpoint";
const key = process.env["EVENT_GRID_NAMESPACES_KEY"] ?? "api_key";
const eventSubscripionName = process.env["EVENT_SUBSCRIPTION_NAME"] ?? "testsubscription1";
const topicName = process.env["TOPIC_NAME"] ?? "testtopic1";

export async function main(): Promise<void> {
  // Create the client used to publish events
  const client = new EventGridClient(endpoint, new AzureKeyCredential(key));

  // publishes a single cloud event
  const eventId: string = `singleEventIdV210001`;
  const cloudEvent: CloudEvent<any> = {
    type: "example",
    source: "https://example.com",
    id: eventId,
    time: new Date(),
    data: {
      resourceUri: "https://dummyurl.com",
    },
    specversion: "1.0",
  };
  // Publish the Cloud Event
  await client.publishCloudEvent(cloudEvent, topicName);
  // Receive the Published Cloud Event
  const receiveResult: ReceiveResult = await client.receiveCloudEvents(
    topicName,
    eventSubscripionName,
  );
  // The Received Cloud Event ID must be equal to the ID of the Event that was published.
  console.log(`Received Event ID: ${receiveResult.value[0].event.id}`);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
