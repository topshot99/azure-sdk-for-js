// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { OperationType, ResourceType } from "../common";

/**
 * @hidden
 */
export interface SessionContext {
  resourceId?: string;
  resourceAddress?: string;
  resourceType?: ResourceType;
  isNameBased?: boolean;
  operationType?: OperationType;
}
