/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { env, Recorder, RecorderStartOptions, isPlaybackMode } from "@azure-tools/test-recorder";
import { createTestCredential } from "@azure-tools/test-credential";
import { SearchManagementClient } from "../src/searchManagementClient.js";
import { describe, it, assert, beforeEach, afterEach } from "vitest";

const replaceableVariables: Record<string, string> = {
  SUBSCRIPTION_ID: "azure_subscription_id",
};

const recorderOptions: RecorderStartOptions = {
  envSetupForPlayback: replaceableVariables,
  sanitizerOptions: {
    bodySanitizers: [
      {
        regex: true,
        value: `fakeKey`,
        target: `[a-z0-9_A-z]{40,100}`,
      },
    ],
    uriSanitizers: [
      {
        regex: true,
        value: `fakeKey`,
        target: `[a-z0-9_A-z]{40,100}`,
      },
    ],
  },
  removeCentralSanitizers: [
    "AZSDK3493", // .name in the body is not a secret and is listed below in the beforeEach section
    "AZSDK3430", // .id in the body is not a secret and is listed below in the beforeEach section
  ],
};

export const testPollingOptions = {
  updateIntervalInMs: isPlaybackMode() ? 0 : undefined,
};

describe("Search test", () => {
  let recorder: Recorder;
  let subscriptionId: string;
  let client: SearchManagementClient;
  let location: string;
  let resourceGroup: string;
  let searchServiceName: string;
  let keyname: string;
  let keyvalue: string;

  beforeEach(async (ctx) => {
    recorder = new Recorder(ctx);
    await recorder.start(recorderOptions);
    subscriptionId = env.SUBSCRIPTION_ID || "";
    // This is an example of how the environment variables are used
    const credential = createTestCredential();
    client = new SearchManagementClient(
      credential,
      subscriptionId,
      recorder.configureClientOptions({
        endpoint: "https://eastus2euap.management.azure.com/",
        credentialScopes: "https://management.azure.com/.default",
      }),
    );
    location = "eastus";
    resourceGroup = "myjstest";
    searchServiceName = "myjssearchservicexxx";
    keyname = "testjskey";
  });

  afterEach(async () => {
    await recorder.stop();
  });

  it("operations list test", async () => {
    const resArray = new Array();
    for await (const item of client.operations.list()) {
      resArray.push(item);
    }
    assert.notEqual(resArray.length, 0);
  });

  it("services create test", async () => {
    const res = await client.services.beginCreateOrUpdateAndWait(
      resourceGroup,
      searchServiceName,
      {
        location: location,
        replicaCount: 1,
        partitionCount: 1,
        hostingMode: "default",
        sku: {
          name: "standard",
        },
      },
      testPollingOptions,
    );
    assert.equal(res.name, searchServiceName);
  });

  it("services get test", async () => {
    const res = await client.services.get(resourceGroup, searchServiceName);
    assert.equal(res.name, searchServiceName);
  });

  it("services list test", async () => {
    const resArray = new Array();
    for await (let item of client.services.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 1);
  });

  it("queryKeys create test", async () => {
    const res = await client.queryKeys.create(resourceGroup, searchServiceName, keyname);
    keyvalue = res.key || "";
    assert.equal(res.name, keyname);
  });

  it("queryKeys list test", async () => {
    const resArray = new Array();
    for await (let item of client.queryKeys.listBySearchService(resourceGroup, searchServiceName)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 2);
  });

  //skip this case as Internal Server Error (HTTP Status Code: 500).
  it.skip("queryKeys delete test", async function () {
    let resArray = new Array();
    for await (let item of client.queryKeys.listBySearchService(resourceGroup, searchServiceName)) {
      resArray.push(item);
    }
    const len = resArray.length;
    // At least one query key
    assert.isTrue(len > 0);
    // Delete the query key by key not by keyname
    await client.queryKeys.delete(resourceGroup, searchServiceName, keyvalue);
    resArray = new Array();
    for await (let item of client.queryKeys.listBySearchService(resourceGroup, searchServiceName)) {
      resArray.push(item);
    }
    // The key number is reduced to len - 1
    assert.equal(resArray.length, len - 1);
  });

  it("services delete test", async () => {
    await client.services.delete(resourceGroup, searchServiceName);
    const resArray = new Array();
    for await (let item of client.services.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 0);
  });
});
