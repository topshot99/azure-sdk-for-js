// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import assert from "assert";
import { Suite } from "mocha";
import {
  Constants,
  Container,
  CosmosClient,
  OperationResponse,
  PatchOperation,
  PatchOperationType,
} from "../../../src";
import { ItemDefinition } from "../../../src";
import {
  bulkDeleteItems,
  bulkInsertItems,
  bulkQueryItemsWithPartitionKey,
  bulkReadItems,
  bulkReplaceItems,
  createOrUpsertItem,
  getTestDatabase,
  removeAllDatabases,
  replaceOrUpsertItem,
  addEntropy,
  getTestContainer,
} from "../common/TestHelpers";
import { BulkOperationType, OperationInput } from "../../../src";
import { endpoint } from "../common/_testConfig";
import { masterKey } from "../common/_fakeTestSecrets";
import { generateOperationOfSize } from "../../internal/unit/utils/batch.spec";
interface TestItem {
  id?: string;
  name?: string;
  foo?: string;
  key?: string;
  replace?: string;
}

describe("Item CRUD", function (this: Suite) {
  this.timeout(process.env.MOCHA_TIMEOUT || 10000);
  beforeEach(async function () {
    await removeAllDatabases();
  });
  const documentCRUDTest = async function (isUpsertTest: boolean): Promise<void> {
    // create database
    const database = await getTestDatabase("sample 中文 database");
    // create container
    const { resource: containerdef } = await database.containers.create({ id: "sample container" });
    const container: Container = database.container(containerdef.id);

    // read items
    const { resources: items } = await container.items.readAll().fetchAll();
    assert(Array.isArray(items), "Value should be an array");

    // create an item
    const beforeCreateDocumentsCount = items.length;
    const itemDefinition: TestItem = {
      name: "sample document",
      foo: "bar",
      key: "value",
      replace: "new property",
    };
    try {
      await createOrUpsertItem(
        container,
        itemDefinition,
        { disableAutomaticIdGeneration: true },
        isUpsertTest
      );
      assert.fail("id generation disabled must throw with invalid id");
    } catch (err: any) {
      assert(
        err !== undefined,
        "should throw an error because automatic id generation is disabled"
      );
    }
    const { resource: document } = await createOrUpsertItem(
      container,
      itemDefinition,
      undefined,
      isUpsertTest
    );
    assert.equal(document.name, itemDefinition.name);
    assert(document.id !== undefined);
    // read documents after creation
    const { resources: documents2 } = await container.items.readAll().fetchAll();
    assert.equal(
      documents2.length,
      beforeCreateDocumentsCount + 1,
      "create should increase the number of documents"
    );
    // query documents
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.id=@id",
      parameters: [
        {
          name: "@id",
          value: document.id,
        },
      ],
    };
    const { resources: results } = await container.items.query(querySpec).fetchAll();
    assert(results.length > 0, "number of results for the query should be > 0");
    const { resources: results2 } = await container.items.query(querySpec).fetchAll();
    assert(results2.length > 0, "number of results for the query should be > 0");

    // replace document
    document.name = "replaced document";
    document.foo = "not bar";
    const { resource: replacedDocument } = await replaceOrUpsertItem(
      container,
      document,
      undefined,
      isUpsertTest
    );
    assert.equal(
      replacedDocument.name,
      "replaced document",
      "document name property should change"
    );
    assert.equal(replacedDocument.foo, "not bar", "property should have changed");
    assert.equal(document.id, replacedDocument.id, "document id should stay the same");
    // read document
    const response2 = await container.item(replacedDocument.id, undefined).read<TestItem>();
    const document2 = response2.resource;
    assert.equal(replacedDocument.id, document2.id);
    assert.equal(typeof response2.requestCharge, "number");
    // delete document
    await container.item(replacedDocument.id, undefined).delete();

    // read documents after deletion
    const response = await container.item(replacedDocument.id, undefined).read();
    assert.equal(response.statusCode, 404, "response should return error code 404");
    assert.equal(response.resource, undefined);
  };

  it("Should do document CRUD operations successfully", async function () {
    await documentCRUDTest(false);
  });

  it("Should do document CRUD operations successfully with upsert", async function () {
    await documentCRUDTest(true);
  });

  it("Should do document CRUD operations over multiple partitions", async function () {
    // create database
    const database = await getTestDatabase("db1");
    const partitionKey = "key";

    // create container
    const containerDefinition = {
      id: "coll1",
      partitionKey: { paths: ["/" + partitionKey] },
    };

    const { resource: containerdef } = await database.containers.create(containerDefinition, {
      offerThroughput: 12000,
    });
    const container = database.container(containerdef.id);

    const documents = [
      { id: "document1" },
      { id: "document2", key: null, prop: 1 },
      { id: "document3", key: false, prop: 1 },
      { id: "document4", key: true, prop: 1 },
      { id: "document5", key: 1, prop: 1 },
      { id: "document6", key: "A", prop: 1 },
      { id: "document7", key: "", prop: 1 },
    ];

    let returnedDocuments = await bulkInsertItems(container, documents);

    assert.equal(returnedDocuments.length, documents.length);
    returnedDocuments.sort(function (doc1, doc2) {
      return doc1.id.localeCompare(doc2.id);
    });
    await bulkReadItems(container, returnedDocuments, partitionKey);
    const { resources: successDocuments } = await container.items.readAll().fetchAll();
    assert(successDocuments !== undefined, "error reading documents");
    assert.equal(
      successDocuments.length,
      returnedDocuments.length,
      "Expected " + returnedDocuments.length + " documents to be succesfully read"
    );
    successDocuments.sort(function (doc1, doc2) {
      return doc1.id.localeCompare(doc2.id);
    });
    assert.equal(
      JSON.stringify(successDocuments),
      JSON.stringify(returnedDocuments),
      "Unexpected documents are returned"
    );

    returnedDocuments.forEach(function (document) {
      document.prop ? ++document.prop : null; // eslint-disable-line no-unused-expressions
    });
    const newReturnedDocuments = await bulkReplaceItems(container, returnedDocuments, partitionKey);
    returnedDocuments = newReturnedDocuments;
    await bulkQueryItemsWithPartitionKey(container, returnedDocuments, partitionKey);
    const querySpec = {
      query: "SELECT * FROM Root",
    };
    const { resources: results } = await container.items
      .query<ItemDefinition>(querySpec, { enableScanInQuery: true })
      .fetchAll();
    assert(results !== undefined, "error querying documents");
    results.sort(function (doc1, doc2) {
      return doc1.id.localeCompare(doc2.id);
    });
    assert.equal(
      results.length,
      returnedDocuments.length,
      "Expected " + returnedDocuments.length + " documents to be succesfully queried"
    );
    assert.equal(
      JSON.stringify(results),
      JSON.stringify(returnedDocuments),
      "Unexpected query results"
    );

    await bulkDeleteItems(container, returnedDocuments, partitionKey);
  });

  it("Should auto generate an id for a collection partitioned on id", async function () {
    // https://github.com/Azure/azure-sdk-for-js/issues/9734
    const container = await getTestContainer("db1", undefined, { partitionKey: "/id" });
    const { resource } = await container.items.create({});
    assert.ok(resource.id);
  });
});
// TODO: Non-deterministic test. We can't guarantee we see any response with a 429 status code since the retries happen within the response
describe("item read retries", async function () {
  xit("retries on 429", async function () {
    const client = new CosmosClient({ key: masterKey, endpoint });
    const { resource: db } = await client.databases.create({
      id: `small db ${Math.random() * 1000}`,
    });
    const containerResponse = await client
      .database(db.id)
      .containers.create({ id: `small container ${Math.random() * 1000}`, throughput: 400 });
    const container = containerResponse.container;
    await container.items.create({ id: "readme" });
    const arr = new Array(400);
    const promises = [];
    for (let i = 0; i < arr.length; i++) {
      promises.push(container.item("readme").read());
    }
    const resp = await Promise.all(promises);
    assert.equal(resp[0].statusCode, 200);
  });
});

describe("bulk/batch item operations", async function () {
  describe("test bulk operations", async function () {
    describe("Check size based splitting of batches", function () {
      let container: Container;
      before(async function () {
        container = await getTestContainer("bulk container", undefined, {
          partitionKey: {
            paths: ["/key"],
            version: undefined,
          },
          throughput: 400,
        });
      });
      after(async () => {
        await container.database.delete();
      });
      it("Check case when cumulative size of all operations is less than threshold", async function () {
        const operations: OperationInput[] = [...Array(10).keys()].map(
          () =>
            ({
              ...generateOperationOfSize(100, { partitionKey: "key_value" }, { key: "key_value" }),
            } as any)
        );
        const response = await container.items.bulk(operations);
        // Create
        response.forEach((res, index) =>
          assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
        );
      });
      it("Check case when cumulative size of all operations is greater than threshold - payload size is 5x threshold", async function () {
        const operations: OperationInput[] = [...Array(10).keys()].map(
          () =>
            ({
              ...generateOperationOfSize(
                Math.floor(Constants.DefaultMaxBulkRequestBodySizeInBytes / 2)
              ),
              partitionKey: {},
            } as any)
        );
        const response = await container.items.bulk(operations);
        // Create
        response.forEach((res, index) =>
          assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
        );
      });
      it("Check case when cumulative size of all operations is greater than threshold - payload size is 25x threshold", async function () {
        const operations: OperationInput[] = [...Array(50).keys()].map(
          () =>
            ({
              ...generateOperationOfSize(
                Math.floor(Constants.DefaultMaxBulkRequestBodySizeInBytes / 2),
                {},
                { key: "key_value" }
              ),
            } as any)
        );
        const response = await container.items.bulk(operations);
        // Create
        response.forEach((res, index) =>
          assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
        );
      });
    });
    describe("v1 container", async function () {
      describe("multi partition container", async function () {
        let container: Container;
        let readItemId: string;
        let replaceItemId: string;
        let deleteItemId: string;
        before(async function () {
          container = await getTestContainer("bulk container", undefined, {
            partitionKey: {
              paths: ["/key"],
              version: undefined,
            },
            throughput: 25100,
          });
          readItemId = addEntropy("item1");
          await container.items.create({
            id: readItemId,
            key: "A",
            class: "2010",
          });
          deleteItemId = addEntropy("item2");
          await container.items.create({
            id: deleteItemId,
            key: "A",
            class: "2010",
          });
          replaceItemId = addEntropy("item3");
          await container.items.create({
            id: replaceItemId,
            key: 5,
            class: "2010",
          });
        });
        after(async () => {
          await container.database.delete();
        });
        it("multi partition container handles create, upsert, replace, delete", async function () {
          const operations = [
            {
              operationType: BulkOperationType.Create,
              resourceBody: { id: addEntropy("doc1"), name: "sample", key: "A" },
            },
            {
              operationType: BulkOperationType.Upsert,
              partitionKey: "A",
              resourceBody: { id: addEntropy("doc2"), name: "other", key: "A" },
            },
            {
              operationType: BulkOperationType.Read,
              id: readItemId,
              partitionKey: "A",
            },
            {
              operationType: BulkOperationType.Delete,
              id: deleteItemId,
              partitionKey: "A",
            },
            {
              operationType: BulkOperationType.Replace,
              partitionKey: 5,
              id: replaceItemId,
              resourceBody: { id: replaceItemId, name: "nice", key: 5 },
            },
          ];
          const response = await container.items.bulk(operations);
          // Create
          assert.equal(response[0].resourceBody.name, "sample");
          assert.equal(response[0].statusCode, 201);
          // Upsert
          assert.equal(response[1].resourceBody.name, "other");
          assert.equal(response[1].statusCode, 201);
          // Read
          assert.equal(response[2].resourceBody.class, "2010");
          assert.equal(response[2].statusCode, 200);
          // Delete
          assert.equal(response[3].statusCode, 204);
          // Replace
          assert.equal(response[4].resourceBody.name, "nice");
          assert.equal(response[4].statusCode, 200);
        });
        it("Check case when cumulative size of all operations is less than threshold", async function () {
          const operations: OperationInput[] = [...Array(10).keys()].map(
            () =>
              ({
                ...generateOperationOfSize(
                  100,
                  { partitionKey: "key_value" },
                  { key: "key_value" }
                ),
              } as any)
          );
          const response = await container.items.bulk(operations);
          // Create
          response.forEach((res, index) =>
            assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
          );
        });
        it("Check case when cumulative size of all operations is greater than threshold", async function () {
          const operations: OperationInput[] = [...Array(10).keys()].map(
            () =>
              ({
                ...generateOperationOfSize(
                  Math.floor(Constants.DefaultMaxBulkRequestBodySizeInBytes / 2)
                ),
                partitionKey: {},
              } as any)
          );
          const response = await container.items.bulk(operations);
          // Create
          response.forEach((res, index) =>
            assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
          );
        });
        it("Check case when cumulative size of all operations is greater than threshold", async function () {
          const operations: OperationInput[] = [...Array(50).keys()].map(
            () =>
              ({
                ...generateOperationOfSize(
                  Math.floor(Constants.DefaultMaxBulkRequestBodySizeInBytes / 2),
                  {},
                  { key: "key_value" }
                ),
              } as any)
          );
          const response = await container.items.bulk(operations);
          // Create
          response.forEach((res, index) =>
            assert.strictEqual(res.statusCode, 201, `Status should be 201 for operation ${index}`)
          );
        });
      });
      describe("single partition container", async function () {
        let container: Container;
        let deleteItemId: string;
        let readItemId: string;
        before(async function () {
          container = await getTestContainer("bulk container");
          deleteItemId = addEntropy("item2");
          readItemId = addEntropy("item2");
          await container.items.create({
            id: deleteItemId,
            key: "A",
            class: "2010",
          });
          await container.items.create({
            id: readItemId,
            key: "B",
            class: "2010",
          });
        });
        it("deletes operation with default partition", async function () {
          const operation: OperationInput = {
            operationType: BulkOperationType.Delete,
            id: deleteItemId,
          };

          const deleteResponse = await container.items.bulk([operation]);
          assert.equal(deleteResponse[0].statusCode, 204);
        });
        it("read operation with default partition", async function () {
          const operation: OperationInput = {
            operationType: BulkOperationType.Read,
            id: readItemId,
          };

          const readResponse: OperationResponse[] = await container.items.bulk([operation]);
          assert.strictEqual(readResponse[0].statusCode, 200);
          assert.strictEqual(
            readResponse[0].resourceBody.id,
            readItemId,
            "Read Items id should match"
          );
        });
        it("create operation with default partition", async function () {
          const id = "testId";
          const createOp: OperationInput = {
            operationType: BulkOperationType.Create,
            resourceBody: {
              id: id,
              key: "B",
              class: "2010",
            },
          };
          const readOp: OperationInput = {
            operationType: BulkOperationType.Read,
            id: id,
          };

          const readResponse: OperationResponse[] = await container.items.bulk([createOp, readOp]);
          assert.strictEqual(readResponse[0].statusCode, 201);
          assert.strictEqual(readResponse[0].resourceBody.id, id, "Created item's id should match");
          assert.strictEqual(readResponse[1].statusCode, 200);
          assert.strictEqual(readResponse[1].resourceBody.id, id, "Read item's id should match");
        });
      });
    });
    describe("v2 container", function () {
      describe("multi partition container", async function () {
        let readItemId: string;
        let replaceItemId: string;
        let patchItemId: string;
        let deleteItemId: string;
        type BulkTestItem = {
          id: string;
          key: any;
          key2?: any;
          key3?: any;
          class?: string;
        };
        type BulkTestDataSet = {
          dbName: string;
          containerRequest: ContainerRequest;
          documentToCreate: BulkTestItem[];
          bulkOperationOptions: BulkOptions;
          operations: {
            description?: string;
            operation: OperationInput;
            expectedOutput?: {
              description?: string;
              statusCode: number;
              propertysToMatch: {
                name: string;
                value: any;
              }[];
            };
          }[];
        };
        const defaultBulkTestDataSet: BulkTestDataSet = {
          dbName: "bulkTestDB",
          bulkOperationOptions: {
            continueOnError: false,
          },
          containerRequest: {
            id: "patchContainer",
            partitionKey: {
              paths: ["/key"],
              version: 2,
            },
            throughput: 25100,
          },
          documentToCreate: [],
          operations: [],
        };
        async function runBulkTestDataSet(dataset: BulkTestDataSet) {
          const client = new CosmosClient({ key: masterKey, endpoint });
          const db = await client.databases.createIfNotExists({ id: dataset.dbName });
          const database = db.database;
          const { container } = await database.containers.createIfNotExists(
            dataset.containerRequest
          );
          try {
            for (const doc of dataset.documentToCreate) {
              await container.items.create(doc);
            }
            const response = await container.items.bulk(
              dataset.operations.map((value) => value.operation),
              dataset.bulkOperationOptions
            );
            dataset.operations.forEach(({ description, expectedOutput }, index) => {
              if (expectedOutput) {
                assert.strictEqual(
                  response[index].statusCode,
                  expectedOutput.statusCode,
                  `Failed during - ${description}`
                );
                expectedOutput.propertysToMatch.forEach(({ name, value }) => {
                  assert.strictEqual(
                    response[index].resourceBody[name],
                    value,
                    `Failed during - ${description}`
                  );
                });
              }
            });
          } finally {
            await database.delete();
          }
        }
        function createBulkOperation(
          operationType: any,
          partitionKeySpecifier?: { partitionKey?: PartitionKey },
          resourceBody?: any,
          id?: string
        ): OperationInput {
          let op: OperationInput = {
            operationType,
            resourceBody,
            ...partitionKeySpecifier,
          };
          if (resourceBody !== undefined) op = { ...op, resourceBody };
          if (id !== undefined) op = { ...op, id } as any;
          return op;
        }
        function creatreBulkOperationExpectedOutput(
          statusCode: number,
          propertysToMatch: { name: string; value: any }[]
        ): {
          statusCode: number;
          propertysToMatch: {
            name: string;
            value: any;
          }[];
        } {
          return {
            statusCode,
            propertysToMatch,
          };
        }
        describe("handles create, upsert, patch, replace, delete", async function () {
          it("Hierarchical Partitions with two keys", async function () {
            readItemId = addEntropy("item1");
            const createItemWithBooleanPartitionKeyId = addEntropy(
              "createItemWithBooleanPartitionKeyId"
            );
            const createItemWithStringPartitionKeyId = addEntropy(
              "createItemWithStringPartitionKeyId"
            );
            const createItemWithUnknownPartitionKeyId = addEntropy(
              "createItemWithUnknownPartitionKeyId"
            );
            const createItemWithNumberPartitionKeyId = addEntropy(
              "createItemWithNumberPartitionKeyId"
            );
            replaceItemId = addEntropy("item3");
            patchItemId = addEntropy("item4");
            deleteItemId = addEntropy("item2");
            const dataset: BulkTestDataSet = {
              dbName: "hierarchical partition bulk 2 keys",
              containerRequest: {
                id: "patchContainer",
                partitionKey: {
                  paths: ["/key", "/key2"],
                  version: PartitionKeyDefinitionVersion.V2,
                  kind: PartitionKeyKind.MultiHash,
                },
                throughput: 25100,
              },
              bulkOperationOptions: {
                continueOnError: true,
              },
              documentToCreate: [
                { id: readItemId, key: true, key2: true, class: "2010" },
                { id: createItemWithBooleanPartitionKeyId, key: true, key2: false, class: "2010" },
                {
                  id: createItemWithUnknownPartitionKeyId,
                  key: undefined,
                  key2: {},
                  class: "2010",
                },
                { id: createItemWithNumberPartitionKeyId, key: 0, key2: 3, class: "2010" },
                { id: createItemWithStringPartitionKeyId, key: 5, key2: {}, class: "2010" },
                { id: deleteItemId, key: {}, key2: {}, class: "2011" },
                { id: replaceItemId, key: 5, key2: 5, class: "2012" },
                { id: patchItemId, key: 5, key2: 5, class: "2019" },
              ],
              operations: [
                {
                  description: "Read document with partitionKey containing booleans values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [true, false] },
                    undefined,
                    createItemWithBooleanPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description: "Read document with partitionKey containing unknown values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [undefined, undefined] },
                    undefined,
                    createItemWithUnknownPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description:
                    "Creating operation's partitionKey to undefined value should fail since internally it would map to [{},{}].",
                  operation: createBulkOperation(
                    BulkOperationType.Create,
                    { partitionKey: undefined },
                    { id: addEntropy("doc10"), name: "sample", key: "A", key2: "B" }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(400, []),
                },
                {
                  description: "Read document with partitionKey containing Number values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [0, 3] },
                    undefined,
                    createItemWithNumberPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description: "Creating document with partitionKey containing 2 strings.",
                  operation: createBulkOperation(
                    BulkOperationType.Create,
                    { partitionKey: ["A", "B"] },
                    { id: addEntropy("doc1"), name: "sample", key: "A", key2: "B" }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(201, [
                    { name: "name", value: "sample" },
                  ]),
                },
                {
                  description: "Creating document with mismatching partition key.",
                  operation: createBulkOperation(
                    BulkOperationType.Create,
                    { partitionKey: ["A", "V"] },
                    { id: addEntropy("doc1"), name: "sample", key: "A", key2: "B" }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(400, []),
                },
                {
                  description: "Upsert document with partitionKey containing 2 strings.",
                  operation: createBulkOperation(
                    BulkOperationType.Upsert,
                    { partitionKey: ["U", "V"] },
                    { name: "other", key: "U", key2: "V" }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(201, [
                    { name: "name", value: "other" },
                  ]),
                },
                {
                  description: "Read document with partitionKey containing 2 booleans.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [true, true] },
                    undefined,
                    readItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description:
                    "Delete document with partitionKey containing 2 undefined partition keys.",
                  operation: createBulkOperation(
                    BulkOperationType.Delete,
                    { partitionKey: [{}, {}] },
                    undefined,
                    deleteItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(204, []),
                },
                {
                  description: "Replace document without specifying partition key.",
                  operation: createBulkOperation(
                    BulkOperationType.Replace,
                    {},
                    { id: replaceItemId, name: "nice", key: 5, key2: 5 },
                    replaceItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "name", value: "nice" },
                  ]),
                },
                {
                  description: "Patch document with partitionKey containing 2 Numbers.",
                  operation: createBulkOperation(
                    BulkOperationType.Patch,
                    { partitionKey: [5, 5] },
                    {
                      operations: [
                        { op: PatchOperationType.add, path: "/great", value: "goodValue" },
                      ],
                    },
                    patchItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "great", value: "goodValue" },
                  ]),
                },
                {
                  description: "Conditional Patch document with partitionKey containing 2 Numbers.",
                  operation: createBulkOperation(
                    BulkOperationType.Patch,
                    { partitionKey: [5, 5] },
                    {
                      operations: [
                        { op: PatchOperationType.add, path: "/good", value: "greatValue" },
                      ],
                      condition: "from c where NOT IS_DEFINED(c.newImproved)",
                    },
                    patchItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, []),
                },
              ],
            };
            await runBulkTestDataSet(dataset);
          });
          it("Hierarchical Partitions with three keys", async function () {
            readItemId = addEntropy("item1");
            const createItemWithBooleanPartitionKeyId = addEntropy(
              "createItemWithBooleanPartitionKeyId"
            );
            const createItemWithStringPartitionKeyId = addEntropy(
              "createItemWithStringPartitionKeyId"
            );
            const createItemWithUnknownPartitionKeyId = addEntropy(
              "createItemWithUnknownPartitionKeyId"
            );
            const createItemWithNumberPartitionKeyId = addEntropy(
              "createItemWithNumberPartitionKeyId"
            );
            replaceItemId = addEntropy("item3");
            patchItemId = addEntropy("item4");
            deleteItemId = addEntropy("item2");
            const dataset: BulkTestDataSet = {
              dbName: "hierarchical partition bulk 3 keys",
              containerRequest: {
                id: "patchContainer",
                partitionKey: {
                  paths: ["/key", "/key2", "/key3"],
                  version: PartitionKeyDefinitionVersion.V2,
                  kind: PartitionKeyKind.MultiHash,
                },
                throughput: 25100,
              },
              documentToCreate: [
                { id: readItemId, key: true, key2: true, key3: true, class: "2010" },
                {
                  id: createItemWithBooleanPartitionKeyId,
                  key: true,
                  key2: false,
                  key3: true,
                  class: "2010",
                },
                {
                  id: createItemWithUnknownPartitionKeyId,
                  key: {},
                  key2: {},
                  key3: {},
                  class: "2010",
                },
                { id: createItemWithNumberPartitionKeyId, key: 0, key2: 3, key3: 5, class: "2010" },
                {
                  id: createItemWithStringPartitionKeyId,
                  key: 5,
                  key2: {},
                  key3: "adsf",
                  class: "2010",
                },
                { id: deleteItemId, key: {}, key2: {}, key3: {}, class: "2011" },
                { id: replaceItemId, key: 5, key2: 5, key3: "T", class: "2012" },
                { id: patchItemId, key: 5, key2: 5, key3: true, class: "2019" },
              ],
              bulkOperationOptions: {
                continueOnError: true,
              },
              operations: [
                {
                  description: "Read document with partitionKey containing booleans values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [true, false, true] },
                    undefined,
                    createItemWithBooleanPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description: "Read document with partitionKey containing unknown values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [{}, {}, {}] },
                    undefined,
                    createItemWithUnknownPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description: "Read document with partitionKey containing Number values.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [0, 3, 5] },
                    undefined,
                    createItemWithNumberPartitionKeyId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description: "Creating document with partitionKey containing 2 strings.",
                  operation: createBulkOperation(
                    BulkOperationType.Create,
                    { partitionKey: ["A", "B", "C"] },
                    { id: addEntropy("doc1"), name: "sample", key: "A", key2: "B", key3: "C" }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(201, [
                    { name: "name", value: "sample" },
                  ]),
                },
                {
                  description: "Creating document with mismatching partition key.",
                  operation: createBulkOperation(
                    BulkOperationType.Create,
                    { partitionKey: ["A", "V", true] },
                    { id: addEntropy("doc1"), name: "sample", key: "A", key2: "B", key3: true }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(400, []),
                },
                {
                  description: "Upsert document with partitionKey containing 2 strings.",
                  operation: createBulkOperation(
                    BulkOperationType.Upsert,
                    { partitionKey: ["U", "V", 5] },
                    { name: "other", key: "U", key2: "V", key3: 5 }
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(201, [
                    { name: "name", value: "other" },
                  ]),
                },
                {
                  description: "Read document with partitionKey containing 2 booleans.",
                  operation: createBulkOperation(
                    BulkOperationType.Read,
                    { partitionKey: [true, true, true] },
                    undefined,
                    readItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "class", value: "2010" },
                  ]),
                },
                {
                  description:
                    "Delete document with partitionKey containing 2 undefined partition keys.",
                  operation: createBulkOperation(
                    BulkOperationType.Delete,
                    { partitionKey: [{}, {}, {}] },
                    undefined,
                    deleteItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(204, []),
                },
                {
                  description: "Replace document without specifying partition key.",
                  operation: createBulkOperation(
                    BulkOperationType.Replace,
                    {},
                    { id: replaceItemId, name: "nice", key: 5, key2: 5, key3: "T" },
                    replaceItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "name", value: "nice" },
                  ]),
                },
                {
                  description: "Patch document with partitionKey containing 2 Numbers.",
                  operation: createBulkOperation(
                    BulkOperationType.Patch,
                    { partitionKey: [5, 5, true] },
                    {
                      operations: [
                        { op: PatchOperationType.add, path: "/great", value: "goodValue" },
                      ],
                    },
                    patchItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, [
                    { name: "great", value: "goodValue" },
                  ]),
                },
                {
                  description: "Conditional Patch document with partitionKey containing 2 Numbers.",
                  operation: createBulkOperation(
                    BulkOperationType.Patch,
                    { partitionKey: [5, 5, true] },
                    {
                      operations: [
                        { op: PatchOperationType.add, path: "/good", value: "greatValue" },
                      ],
                      condition: "from c where NOT IS_DEFINED(c.newImproved)",
                    },
                    patchItemId
                  ),
                  expectedOutput: creatreBulkOperationExpectedOutput(200, []),
                },
              ],
            };
            await runBulkTestDataSet(dataset);
          });
        });
        it("respects order", async function () {
          readItemId = addEntropy("item1");
          const dataset: BulkTestDataSet = {
            ...defaultBulkTestDataSet,
            documentToCreate: [{ id: readItemId, key: "A", class: "2010" }],
            operations: [
              {
                description: "Delete for an existing item should suceed.",
                operation: createBulkOperation(
                  BulkOperationType.Delete,
                  { partitionKey: "A" },
                  undefined,
                  readItemId
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(204, []),
              },
              {
                description: "Delete occurs first, so the read returns a 404.",
                operation: createBulkOperation(
                  BulkOperationType.Read,
                  { partitionKey: "A" },
                  undefined,
                  readItemId
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(404, []),
              },
            ],
          };
          await runBulkTestDataSet(dataset);
        });
        it("424 errors for operations after an error", async function () {
          const dataset: BulkTestDataSet = {
            ...defaultBulkTestDataSet,
            documentToCreate: [],
            operations: [
              {
                description: "Operation should fail with invalid ttl.",
                operation: createBulkOperation(
                  BulkOperationType.Create,
                  {},
                  { ttl: -10, key: "A" }
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(400, []),
              },
              {
                description: "",
                operation: createBulkOperation(
                  BulkOperationType.Create,
                  { partitionKey: "A" },
                  { key: "A", licenseType: "B", id: "o239uroihndsf" }
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(424, []),
              },
            ],
          };
          await runBulkTestDataSet(dataset);
        });
        it("Continues after errors with continueOnError true", async function () {
          const dataset: BulkTestDataSet = {
            ...defaultBulkTestDataSet,
            documentToCreate: [],
            bulkOperationOptions: {
              continueOnError: true,
            },
            operations: [
              {
                description: "Operation should fail with invalid ttl.",
                operation: createBulkOperation(
                  BulkOperationType.Create,
                  {},
                  { ttl: -10, key: "A" }
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(400, []),
              },
              {
                description:
                  "Operation should suceed and should not be abondoned because of previous failure, since continueOnError is true.",
                operation: createBulkOperation(
                  BulkOperationType.Create,
                  {},
                  { key: "A", licenseType: "B", id: addEntropy("sifjsiof") }
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(201, []),
              },
            ],
          };
          await runBulkTestDataSet(dataset);
        });
        it("autogenerates IDs for Create operations", async function () {
          const dataset: BulkTestDataSet = {
            ...defaultBulkTestDataSet,
            operations: [
              {
                description: "Operation should fail with invalid ttl.",
                operation: createBulkOperation(
                  BulkOperationType.Create,
                  {},
                  { key: "A", licenseType: "C" }
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(201, []),
              },
            ],
          };
          await runBulkTestDataSet(dataset);
        });
        it("handles operations with null, undefined, and 0 partition keys", async function () {
          const item1Id = addEntropy("item1");
          const item2Id = addEntropy("item2");
          const item3Id = addEntropy("item2");
          const dataset: BulkTestDataSet = {
            ...defaultBulkTestDataSet,
            documentToCreate: [
              { id: item1Id, key: null, class: "2010" },
              { id: item2Id, key: 0 },
              { id: item3Id, key: undefined },
            ],
            operations: [
              {
                description: "Read document with null partition key should suceed.",
                operation: createBulkOperation(
                  BulkOperationType.Read,
                  { partitionKey: null },
                  {},
                  item1Id
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(200, []),
              },
              {
                description: "Read document with 0 partition key should suceed.",
                operation: createBulkOperation(
                  BulkOperationType.Read,
                  { partitionKey: 0 },
                  {},
                  item2Id
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(200, []),
              },
              {
                description: "Read document with undefined partition key should suceed.",
                operation: createBulkOperation(
                  BulkOperationType.Read,
                  { partitionKey: undefined },
                  {},
                  item3Id
                ),
                expectedOutput: creatreBulkOperationExpectedOutput(200, []),
              },
            ],
          };
          await runBulkTestDataSet(dataset);

      const deleteResponse = await container.items.bulk([operation]);
      assert.equal(deleteResponse[0].statusCode, 204);
    });
  });
  describe("v2 multi partition container", async function () {
    let container: Container;
    let createItemId: string;
    let upsertItemId: string;
    before(async function () {
      container = await getTestContainer("bulk container", undefined, {
        partitionKey: {
          paths: ["/nested/key"],
          version: 2,
        },
        throughput: 25100,
      });
      createItemId = addEntropy("createItem");
      upsertItemId = addEntropy("upsertItem");
    });
    it("creates an item with nested object partition key", async function () {
      const operations: OperationInput[] = [
        {
          operationType: BulkOperationType.Create,
          resourceBody: {
            id: createItemId,
            nested: {
              key: "A",
            },
          },
        },
        {
          operationType: BulkOperationType.Upsert,
          resourceBody: {
            id: upsertItemId,
            nested: {
              key: false,
            },
          },
        },
      ];

      const createResponse = await container.items.bulk(operations);
      assert.equal(createResponse[0].statusCode, 201);
    });
  });

  // TODO: Non-deterministic test. We can't guarantee we see any response with a 429 status code since the retries happen within the response
  describe("item read retries", async function () {
    it("retries on 429", async function () {
      const client = new CosmosClient({ key: masterKey, endpoint });
      const { resource: db } = await client.databases.create({
        id: `small db ${Math.random() * 1000}`,
      });
      const containerResponse = await client
        .database(db.id)
        .containers.create({ id: `small container ${Math.random() * 1000}`, throughput: 400 });
      const container = containerResponse.container;
      await container.items.create({ id: "readme" });
      const arr = new Array(400);
      const promises = [];
      for (let i = 0; i < arr.length; i++) {
        promises.push(container.item("readme").read());
      }
      const resp = await Promise.all(promises);
      assert.equal(resp[0].statusCode, 200);
    });
  });

  describe("v2 single partition container", async function () {
    let container: Container;
    let createItemId: string;
    let otherItemId: string;
    let upsertItemId: string;
    let replaceItemId: string;
    let deleteItemId: string;
    let patchItemId: string;
    before(async function () {
      const client = new CosmosClient({ key: masterKey, endpoint });
      const db = await client.databases.createIfNotExists({ id: "patchDb" });
      const contResponse = await db.database.containers.createIfNotExists({
        id: "patchContainer",
        partitionKey: {
          paths: ["/key"],
          version: 2,
        },
        throughput: 25100,
      });
      container = contResponse.container;
      deleteItemId = addEntropy("item1");
      createItemId = addEntropy("item2");
      otherItemId = addEntropy("item2");
      upsertItemId = addEntropy("item4");
      replaceItemId = addEntropy("item3");
      patchItemId = addEntropy("item5");
      await container.items.create({
        id: deleteItemId,
        key: "A",
        class: "2010",
      });
      await container.items.create({
        id: replaceItemId,
        key: "A",
        class: "2010",
      });
      await container.items.create({
        id: patchItemId,
        key: "A",
        class: "2010",
      });
    });
    it("can batch all operation types", async function () {
      const operations: OperationInput[] = [
        {
          operationType: BulkOperationType.Create,
          resourceBody: { id: createItemId, key: "A", school: "high" },
        },
        {
          operationType: BulkOperationType.Upsert,
          resourceBody: { id: upsertItemId, key: "A", school: "elementary" },
        },
        {
          operationType: BulkOperationType.Replace,
          id: replaceItemId,
          resourceBody: { id: replaceItemId, key: "A", school: "junior high" },
        },
        {
          operationType: BulkOperationType.Delete,
          id: deleteItemId,
        },
        {
          operationType: BulkOperationType.Patch,
          id: patchItemId,
          resourceBody: {
            operations: [{ op: PatchOperationType.add, path: "/good", value: "greatValue" }],
            condition: "from c where NOT IS_DEFINED(c.newImproved)",
          },
        },
      ];

      const response = await container.items.batch(operations, "A");
      assert(isOperationResponse(response.result[0]));
      assert.strictEqual(response.result[0].statusCode, 201);
      assert.strictEqual(response.result[1].statusCode, 201);
      assert.strictEqual(response.result[2].statusCode, 200);
      assert.strictEqual(response.result[3].statusCode, 204);
      assert.strictEqual(response.result[4].statusCode, 200);
    });
    it("rolls back prior operations when one fails", async function () {
      const operations: OperationInput[] = [
        {
          operationType: BulkOperationType.Upsert,
          resourceBody: { id: otherItemId, key: "A", school: "elementary" },
        },
        {
          operationType: BulkOperationType.Delete,
          id: deleteItemId + addEntropy("make this 404"),
        },
      ];

      const deleteResponse = await container.items.batch(operations, "A");
      assert.strictEqual(deleteResponse.result[0].statusCode, 424);
      assert.strictEqual(deleteResponse.result[1].statusCode, 404);
      const { resource: readItem } = await container.item(otherItemId).read();
      assert.strictEqual(readItem, undefined);
      assert(isOperationResponse(deleteResponse.result[0]));
    });

    function isOperationResponse(object: unknown): object is OperationResponse {
      return (
        typeof object === "object" &&
        object !== null &&
        Object.prototype.hasOwnProperty.call(object, "statusCode") &&
        Object.prototype.hasOwnProperty.call(object, "requestCharge")
      );
    }
  });
});
describe("patch operations", function () {
  describe("various mixed operations", function () {
    let container: Container;
    let addItemId: string;
    let conditionItemId: string;
    before(async function () {
      addItemId = addEntropy("addItemId");
      conditionItemId = addEntropy("conditionItemId");
      const client = new CosmosClient({ key: masterKey, endpoint });
      const db = await client.databases.createIfNotExists({ id: "patchDb" });
      const contResponse = await db.database.containers.createIfNotExists({
        id: "patchContainer",
        partitionKey: {
          paths: ["/key"],
          version: 2,
        },
        throughput: 25100,
      });
      container = contResponse.container;
      await container.items.upsert({
        id: addItemId,
        first: 1,
        last: "a",
        removable: "yes",
        existingObj: {
          key: "val",
        },
        num: 0,
      });
      await container.items.upsert({
        id: conditionItemId,
        first: 1,
        last: "a",
        removable: "no",
        existingObj: {
          key: "val",
        },
        num: 0,
      });
    });
    it("handles add, remove, replace, set, incr", async function () {
      const operations: PatchOperation[] = [
        {
          op: "add",
          path: "/laster",
          value: "c",
        },
        {
          op: "replace",
          path: "/last",
          value: "b",
        },
        {
          op: "remove",
          path: "/removable",
        },
        {
          op: "set",
          path: "/existingObj/newKey",
          value: "newVal",
        },
        {
          op: "incr",
          path: "/num",
          value: 5,
        },
      ];
      const { resource: addItem } = await container.item(addItemId).patch(operations);
      assert.strictEqual(addItem.num, 5);
      assert.strictEqual(addItem.existingObj.newKey, "newVal");
      assert.strictEqual(addItem.laster, "c");
      assert.strictEqual(addItem.last, "b");
      assert.strictEqual(addItem.removable, undefined);
    });
    it("conditionally patches", async function () {
      const operations: PatchOperation[] = [
        {
          op: "add",
          path: "/newImproved",
          value: "it works",
        },
      ];
      const condition = "from c where NOT IS_DEFINED(c.newImproved)";
      const { resource: conditionItem } = await container
        .item(conditionItemId)
        .patch({ condition, operations });
      assert.strictEqual(conditionItem.newImproved, "it works");
    });
  });
});
