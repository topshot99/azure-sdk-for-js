// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Integration test for GitHub issue #37024
 * Validates that FeedOptions.partitionKey correctly scopes queries
 * when the query plan execution path is used (forceQueryPlan: true).
 */

import type { Container } from "../../../src/index.js";
import {
  getTestContainer,
  removeAllDatabases,
  bulkInsertItems,
} from "../common/TestHelpers.js";
import { describe, it, assert, beforeEach, afterEach } from "vitest";

describe("FeedOptions.partitionKey with query plan path (issue #37024)", { timeout: 30000 }, () => {
  let container: Container;

  const items = [
    { id: "1", category: "Electronics", name: "Laptop" },
    { id: "2", category: "Electronics", name: "Phone" },
    { id: "3", category: "Books", name: "Novel" },
    { id: "4", category: "Books", name: "Textbook" },
    { id: "5", category: "Clothing", name: "Shirt" },
  ];

  beforeEach(async () => {
    await removeAllDatabases();
    container = await getTestContainer("partitionKey query plan test", undefined, {
      id: "testContainer",
      partitionKey: { paths: ["/category"] },
    });
    await bulkInsertItems(container, items);
  });

  afterEach(async () => {
    await removeAllDatabases();
  });

  it("partitionKey in FeedOptions should scope query when forceQueryPlan is true", async () => {
    const queryIterator = container.items.query("SELECT * FROM c", {
      partitionKey: "Electronics",
      forceQueryPlan: true,
    });

    const { resources } = await queryIterator.fetchAll();

    assert.equal(resources.length, 2, "Should return only Electronics items");
    assert.isTrue(
      resources.every((r: any) => r.category === "Electronics"),
      "All returned items should be Electronics",
    );
  });

  it("partitionKey in FeedOptions should scope query without forceQueryPlan", async () => {
    const queryIterator = container.items.query("SELECT * FROM c", {
      partitionKey: "Electronics",
    });

    const { resources } = await queryIterator.fetchAll();

    assert.equal(resources.length, 2, "Should return only Electronics items");
    assert.isTrue(
      resources.every((r: any) => r.category === "Electronics"),
      "All returned items should be Electronics",
    );
  });

  it("without partitionKey should return all items with forceQueryPlan", async () => {
    const queryIterator = container.items.query("SELECT * FROM c", {
      forceQueryPlan: true,
    });

    const { resources } = await queryIterator.fetchAll();

    assert.equal(resources.length, 5, "Should return all items without partition key filter");
  });

  it("partitionKey with ORDER BY should scope correctly", async () => {
    const queryIterator = container.items.query("SELECT * FROM c ORDER BY c.name", {
      partitionKey: "Books",
      forceQueryPlan: true,
    });

    const { resources } = await queryIterator.fetchAll();

    assert.equal(resources.length, 2, "Should return only Books items");
    assert.isTrue(
      resources.every((r: any) => r.category === "Books"),
      "All returned items should be Books",
    );
  });

  it("partitionKey with aggregate should scope correctly", async () => {
    const queryIterator = container.items.query(
      "SELECT VALUE COUNT(1) FROM c",
      {
        partitionKey: "Electronics",
        forceQueryPlan: true,
      },
    );

    const { resources } = await queryIterator.fetchAll();

    assert.equal(resources[0], 2, "Count should be 2 for Electronics partition");
  });
});
