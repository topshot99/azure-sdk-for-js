// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { JSONObject } from "../queryExecutionContext";
import { extractPartitionKey } from "../extractPartitionKey";
import { PartitionKeyDefinition } from "../documents";
import { RequestOptions } from "..";
import { PatchRequestBody } from "./patch";
import { v4 } from "uuid";
import { bodyFromData } from "../request/request";
import { Constants } from "../common/constants";
import { hashV1PartitionKey } from "./hashing/v1";
import { hashV2PartitionKey } from "./hashing/v2";
import {PartitionKeyRange } from "../client/Container"
const uuid = v4;

export type Operation =
  | CreateOperation
  | UpsertOperation
  | ReadOperation
  | DeleteOperation
  | ReplaceOperation
  | BulkPatchOperation;

export interface Batch {
  min: string;
  max: string;
  rangeId: string;
  indexes: number[];
  operations: Operation[];
}

export interface OperationResponse {
  statusCode: number;
  requestCharge: number;
  eTag?: string;
  resourceBody?: JSONObject;
}

/**
 * Options object used to modify bulk execution.
 * continueOnError (Default value: false) - Continues bulk execution when an operation fails ** NOTE THIS WILL DEFAULT TO TRUE IN the 4.0 RELEASE
 */
export interface BulkOptions {
  continueOnError?: boolean;
}

export function isKeyInRange(min: string, max: string, key: string): boolean {
  const isAfterMinInclusive = key.localeCompare(min) >= 0;
  const isBeforeMax = key.localeCompare(max) < 0;
  return isAfterMinInclusive && isBeforeMax;
}

export interface OperationBase {
  partitionKey?: string;
  ifMatch?: string;
  ifNoneMatch?: string;
}

export const BulkOperationType = {
  Create: "Create",
  Upsert: "Upsert",
  Read: "Read",
  Delete: "Delete",
  Replace: "Replace",
  Patch: "Patch",
} as const;

export type OperationInput =
  | CreateOperationInput
  | UpsertOperationInput
  | ReadOperationInput
  | DeleteOperationInput
  | ReplaceOperationInput
  | PatchOperationInput;

export interface CreateOperationInput {
  partitionKey?: string | number | null | Record<string, unknown> | undefined;
  ifMatch?: string;
  ifNoneMatch?: string;
  operationType: typeof BulkOperationType.Create;
  resourceBody: JSONObject;
}

export interface UpsertOperationInput {
  partitionKey?: string | number | null | Record<string, unknown> | undefined;
  ifMatch?: string;
  ifNoneMatch?: string;
  operationType: typeof BulkOperationType.Upsert;
  resourceBody: JSONObject;
}

export interface ReadOperationInput {
  partitionKey?: string | number | boolean | null | Record<string, unknown> | undefined;
  operationType: typeof BulkOperationType.Read;
  id: string;
}

export interface DeleteOperationInput {
  partitionKey?: string | number | null | Record<string, unknown> | undefined;
  operationType: typeof BulkOperationType.Delete;
  id: string;
}

export interface ReplaceOperationInput {
  partitionKey?: string | number | null | Record<string, unknown> | undefined;
  ifMatch?: string;
  ifNoneMatch?: string;
  operationType: typeof BulkOperationType.Replace;
  resourceBody: JSONObject;
  id: string;
}

export interface PatchOperationInput {
  partitionKey?: string | number | null | Record<string, unknown> | undefined;
  ifMatch?: string;
  ifNoneMatch?: string;
  operationType: typeof BulkOperationType.Patch;
  resourceBody: PatchRequestBody;
  id: string;
}

export type OperationWithItem = OperationBase & {
  resourceBody: JSONObject;
};

export type CreateOperation = OperationWithItem & {
  operationType: typeof BulkOperationType.Create;
};

export type UpsertOperation = OperationWithItem & {
  operationType: typeof BulkOperationType.Upsert;
};

export type ReadOperation = OperationBase & {
  operationType: typeof BulkOperationType.Read;
  id: string;
};

export type DeleteOperation = OperationBase & {
  operationType: typeof BulkOperationType.Delete;
  id: string;
};

export type ReplaceOperation = OperationWithItem & {
  operationType: typeof BulkOperationType.Replace;
  id: string;
};

export type BulkPatchOperation = OperationBase & {
  operationType: typeof BulkOperationType.Patch;
  id: string;
};

export function hasResource(
  operation: Operation
): operation is CreateOperation | UpsertOperation | ReplaceOperation {
  return (
    operation.operationType !== "Patch" &&
    (operation as OperationWithItem).resourceBody !== undefined
  );
}

export function getPartitionKeyToHash(operation: Operation, partitionProperty: string): any {
  const toHashKey = hasResource(operation)
    ? deepFind(operation.resourceBody, partitionProperty)
    : (operation.partitionKey && operation.partitionKey.replace(/[[\]"']/g, "")) ||
      operation.partitionKey;
  // We check for empty object since replace will stringify the value
  // The second check avoids cases where the partitionKey value is actually the string '{}'
  if (toHashKey === "{}" && operation.partitionKey === "[{}]") {
    return {};
  }
  if (toHashKey === "null" && operation.partitionKey === "[null]") {
    return null;
  }
  if (toHashKey === "0" && operation.partitionKey === "[0]") {
    return 0;
  }
  return toHashKey;
}

export function decorateOperation(
  operation: OperationInput,
  definition: PartitionKeyDefinition,
  options: RequestOptions = {}
): Operation {
  if (
    operation.operationType === BulkOperationType.Create ||
    operation.operationType === BulkOperationType.Upsert
  ) {
    if (
      (operation.resourceBody.id === undefined || operation.resourceBody.id === "") &&
      !options.disableAutomaticIdGeneration
    ) {
      operation.resourceBody.id = uuid();
    }
  }
  if ("partitionKey" in operation) {
    const extracted = extractPartitionKey(operation, { paths: ["/partitionKey"] });
    return { ...operation, partitionKey: JSON.stringify(extracted) } as Operation;
  } else if (
    operation.operationType === BulkOperationType.Create ||
    operation.operationType === BulkOperationType.Replace ||
    operation.operationType === BulkOperationType.Upsert
  ) {
    const pk = extractPartitionKey(operation.resourceBody, definition);
    return { ...operation, partitionKey: JSON.stringify(pk) } as Operation;
  } else if (
    operation.operationType === BulkOperationType.Read ||
    operation.operationType === BulkOperationType.Delete
  ) {
    return { ...operation, partitionKey: "[{}]" };
  }
  return operation as Operation;
}

/**
 * Splits a batch into array of batches based on cumulative size of its operations by making sure
 * cumulative size of an individual batch is not larger than {@link Constants.DefaultMaxBulkRequestBodySizeInBytes}.
 * If a single operation itself is larger than {@link Constants.DefaultMaxBulkRequestBodySizeInBytes}, that
 * operation would be moved into a batch containing only that operation.
 * @param originalBatch - A batch of operations needed to be checked.
 * @returns
 * @hidden
 */
export function splitBatchBasedOnBodySize(originalBatch: Batch): Batch[] {
  if (originalBatch?.operations === undefined || originalBatch.operations.length < 1) return [];
  let currentBatchSize = calculateObjectSizeInBytes(originalBatch.operations[0]);
  let currentBatch: Batch = {
    ...originalBatch,
    operations: [originalBatch.operations[0]],
    indexes: [originalBatch.indexes[0]],
  };
  const processedBatches: Batch[] = [];
  processedBatches.push(currentBatch);

  for (let index = 1; index < originalBatch.operations.length; index++) {
    const operation = originalBatch.operations[index];
    const currentOpSize = calculateObjectSizeInBytes(operation);
    if (currentBatchSize + currentOpSize > Constants.DefaultMaxBulkRequestBodySizeInBytes) {
      currentBatch = {
        ...originalBatch,
        operations: [],
        indexes: [],
      };
      processedBatches.push(currentBatch);
      currentBatchSize = 0;
    }
    currentBatch.operations.push(operation);
    currentBatch.indexes.push(originalBatch.indexes[index]);
    currentBatchSize += currentOpSize;
  }
  return processedBatches;
}

/**
 * Calculates size of an JSON object in bytes with utf-8 encoding.
 * @hidden
 */
export function calculateObjectSizeInBytes(obj: unknown): number {
  return new TextEncoder().encode(bodyFromData(obj as any)).length;
}

export function decorateBatchOperation(
  operation: OperationInput,
  options: RequestOptions = {}
): Operation {
  if (
    operation.operationType === BulkOperationType.Create ||
    operation.operationType === BulkOperationType.Upsert
  ) {
    if (
      (operation.resourceBody.id === undefined || operation.resourceBody.id === "") &&
      !options.disableAutomaticIdGeneration
    ) {
      operation.resourceBody.id = uuid();
    }
  }
  return operation as Operation;
}
/**
 * Util function for finding partition key values nested in objects at slash (/) separated paths
 * @hidden
 */
export function deepFind<T, P extends string>(document: T, path: P): string | JSONObject {
  const apath = path.split("/");
  let h: any = document;
  for (const p of apath) {
    if (p in h) h = h[p];
    else {
      if (p !== "_partitionKey") {
        console.warn(`Partition key not found, using undefined: ${path} at ${p}`);
      }
      return "{}";
    }
  }
  return h;
}

export function updateBatches(
  batches: Batch[],
  rangeToOverlappingIntervals: Map<string, PartitionKeyRange[]>,
  definition: PartitionKeyDefinition
) {
  const newBatches: Batch[] = [];
  batches.forEach((batch: Batch) => {
    const overlappingIntervals = rangeToOverlappingIntervals.get(batch.rangeId);
    if (overlappingIntervals.length === 1) {
      if (
        batch.min === overlappingIntervals[0].minInclusive &&
        batch.max === overlappingIntervals[0].maxExclusive
      ) {
        batch.rangeId = overlappingIntervals[0].id;
      } else {
        const newBatch: Batch = {
          min: overlappingIntervals[0].minInclusive,
          max: overlappingIntervals[0].maxExclusive,
          rangeId: overlappingIntervals[0].id,
          indexes: batch.indexes,
          operations: batch.operations,
        };
        newBatches.push(newBatch);
        batches.push(...newBatches);
      }
    } else if (overlappingIntervals.length > 1) {
      // Split the batch into multiple batches based on the overlapping intervals.
      overlappingIntervals.forEach((interval: PartitionKeyRange) => {
        const newBatch: Batch = {
          min: interval.minInclusive,
          max: interval.maxExclusive,
          rangeId: interval.id,
          indexes: [],
          operations: [],
        };
        newBatches.push(newBatch);
      });

      const partitionProp = definition.paths[0].replace("/", "");
      const isV2 = definition.version && definition.version === 2;

      // Reassign operations to new batches.
      batch.operations.forEach((operation, index) => {
        const toHashKey = getPartitionKeyToHash(operation, partitionProp);
        const hashed = isV2 ? hashV2PartitionKey(toHashKey) : hashV1PartitionKey(toHashKey);
        const batchForKey = newBatches.find((batch: Batch) =>
          isKeyInRange(batch.min, batch.max, hashed)
        );
        batchForKey.operations.push(operation);
        batchForKey.indexes.push(batch.indexes[index]);
      });
      batches.push(...newBatches);
    }
  });
}

export function findOverlappingIntervals(
  initialList: PartitionKeyRange[],
  updatedList: PartitionKeyRange[]
): Map<string, PartitionKeyRange[]> {
  // sort updated list by minInclusive
  const sortedUpdatedList = updatedList.sort((a: PartitionKeyRange, b: PartitionKeyRange) =>
    a.minInclusive.localeCompare(b.minInclusive)
  );

  return initialList.reduce(
    (result: Map<string, PartitionKeyRange[]>, initial: PartitionKeyRange) => {
      const overlaps = sortedUpdatedList.filter(
        (updated: PartitionKeyRange) =>
          updated.maxExclusive >= initial.minInclusive &&
          updated.minInclusive <= initial.maxExclusive
      );
      result.set(initial.id, overlaps);
      return result;
    },
    new Map<string, PartitionKeyRange[]>()
  );
}
