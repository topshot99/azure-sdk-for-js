/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator } from "@azure/core-paging";
import {
  ManagedVMSize,
  ManagedUnsupportedVMSizesListOptionalParams,
  ManagedUnsupportedVMSizesGetOptionalParams,
  ManagedUnsupportedVMSizesGetResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a ManagedUnsupportedVMSizes. */
export interface ManagedUnsupportedVMSizes {
  /**
   * Get the lists of unsupported vm sizes for Service Fabric Managed Clusters.
   * @param location The location for the cluster code versions. This is different from cluster location.
   * @param options The options parameters.
   */
  list(
    location: string,
    options?: ManagedUnsupportedVMSizesListOptionalParams,
  ): PagedAsyncIterableIterator<ManagedVMSize>;
  /**
   * Get unsupported vm size for Service Fabric Managed Clusters.
   * @param location The location for the cluster code versions. This is different from cluster location.
   * @param vmSize VM Size name.
   * @param options The options parameters.
   */
  get(
    location: string,
    vmSize: string,
    options?: ManagedUnsupportedVMSizesGetOptionalParams,
  ): Promise<ManagedUnsupportedVMSizesGetResponse>;
}
