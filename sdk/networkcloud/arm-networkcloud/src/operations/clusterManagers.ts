/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper.js";
import { ClusterManagers } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import { NetworkCloud } from "../networkCloud.js";
import {
  SimplePollerLike,
  OperationState,
  createHttpPoller,
} from "@azure/core-lro";
import { createLroSpec } from "../lroImpl.js";
import {
  ClusterManager,
  ClusterManagersListBySubscriptionNextOptionalParams,
  ClusterManagersListBySubscriptionOptionalParams,
  ClusterManagersListBySubscriptionResponse,
  ClusterManagersListByResourceGroupNextOptionalParams,
  ClusterManagersListByResourceGroupOptionalParams,
  ClusterManagersListByResourceGroupResponse,
  ClusterManagersGetOptionalParams,
  ClusterManagersGetResponse,
  ClusterManagersCreateOrUpdateOptionalParams,
  ClusterManagersCreateOrUpdateResponse,
  ClusterManagersDeleteOptionalParams,
  ClusterManagersDeleteResponse,
  ClusterManagersUpdateOptionalParams,
  ClusterManagersUpdateResponse,
  ClusterManagersListBySubscriptionNextResponse,
  ClusterManagersListByResourceGroupNextResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Class containing ClusterManagers operations. */
export class ClusterManagersImpl implements ClusterManagers {
  private readonly client: NetworkCloud;

  /**
   * Initialize a new instance of the class ClusterManagers class.
   * @param client Reference to the service client
   */
  constructor(client: NetworkCloud) {
    this.client = client;
  }

  /**
   * Get a list of cluster managers in the provided subscription.
   * @param options The options parameters.
   */
  public listBySubscription(
    options?: ClusterManagersListBySubscriptionOptionalParams,
  ): PagedAsyncIterableIterator<ClusterManager> {
    const iter = this.listBySubscriptionPagingAll(options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listBySubscriptionPagingPage(options, settings);
      },
    };
  }

  private async *listBySubscriptionPagingPage(
    options?: ClusterManagersListBySubscriptionOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<ClusterManager[]> {
    let result: ClusterManagersListBySubscriptionResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listBySubscription(options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listBySubscriptionNext(continuationToken, options);
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listBySubscriptionPagingAll(
    options?: ClusterManagersListBySubscriptionOptionalParams,
  ): AsyncIterableIterator<ClusterManager> {
    for await (const page of this.listBySubscriptionPagingPage(options)) {
      yield* page;
    }
  }

  /**
   * Get a list of cluster managers in the provided resource group.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  public listByResourceGroup(
    resourceGroupName: string,
    options?: ClusterManagersListByResourceGroupOptionalParams,
  ): PagedAsyncIterableIterator<ClusterManager> {
    const iter = this.listByResourceGroupPagingAll(resourceGroupName, options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listByResourceGroupPagingPage(
          resourceGroupName,
          options,
          settings,
        );
      },
    };
  }

  private async *listByResourceGroupPagingPage(
    resourceGroupName: string,
    options?: ClusterManagersListByResourceGroupOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<ClusterManager[]> {
    let result: ClusterManagersListByResourceGroupResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listByResourceGroup(resourceGroupName, options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listByResourceGroupNext(
        resourceGroupName,
        continuationToken,
        options,
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listByResourceGroupPagingAll(
    resourceGroupName: string,
    options?: ClusterManagersListByResourceGroupOptionalParams,
  ): AsyncIterableIterator<ClusterManager> {
    for await (const page of this.listByResourceGroupPagingPage(
      resourceGroupName,
      options,
    )) {
      yield* page;
    }
  }

  /**
   * Get a list of cluster managers in the provided subscription.
   * @param options The options parameters.
   */
  private _listBySubscription(
    options?: ClusterManagersListBySubscriptionOptionalParams,
  ): Promise<ClusterManagersListBySubscriptionResponse> {
    return this.client.sendOperationRequest(
      { options },
      listBySubscriptionOperationSpec,
    );
  }

  /**
   * Get a list of cluster managers in the provided resource group.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  private _listByResourceGroup(
    resourceGroupName: string,
    options?: ClusterManagersListByResourceGroupOptionalParams,
  ): Promise<ClusterManagersListByResourceGroupResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, options },
      listByResourceGroupOperationSpec,
    );
  }

  /**
   * Get the properties of the provided cluster manager.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterManagerName: string,
    options?: ClusterManagersGetOptionalParams,
  ): Promise<ClusterManagersGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterManagerName, options },
      getOperationSpec,
    );
  }

  /**
   * Create a new cluster manager or update properties of the cluster manager if it exists.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param clusterManagerParameters The request body.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    clusterManagerName: string,
    clusterManagerParameters: ClusterManager,
    options?: ClusterManagersCreateOrUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<ClusterManagersCreateOrUpdateResponse>,
      ClusterManagersCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<ClusterManagersCreateOrUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ) => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined =
        undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown,
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback,
        },
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON(),
        },
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: {
        resourceGroupName,
        clusterManagerName,
        clusterManagerParameters,
        options,
      },
      spec: createOrUpdateOperationSpec,
    });
    const poller = await createHttpPoller<
      ClusterManagersCreateOrUpdateResponse,
      OperationState<ClusterManagersCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "azure-async-operation",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create a new cluster manager or update properties of the cluster manager if it exists.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param clusterManagerParameters The request body.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterManagerName: string,
    clusterManagerParameters: ClusterManager,
    options?: ClusterManagersCreateOrUpdateOptionalParams,
  ): Promise<ClusterManagersCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      clusterManagerName,
      clusterManagerParameters,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Delete the provided cluster manager.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param options The options parameters.
   */
  async beginDelete(
    resourceGroupName: string,
    clusterManagerName: string,
    options?: ClusterManagersDeleteOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<ClusterManagersDeleteResponse>,
      ClusterManagersDeleteResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<ClusterManagersDeleteResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ) => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined =
        undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown,
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback,
        },
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON(),
        },
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: { resourceGroupName, clusterManagerName, options },
      spec: deleteOperationSpec,
    });
    const poller = await createHttpPoller<
      ClusterManagersDeleteResponse,
      OperationState<ClusterManagersDeleteResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "location",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Delete the provided cluster manager.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param options The options parameters.
   */
  async beginDeleteAndWait(
    resourceGroupName: string,
    clusterManagerName: string,
    options?: ClusterManagersDeleteOptionalParams,
  ): Promise<ClusterManagersDeleteResponse> {
    const poller = await this.beginDelete(
      resourceGroupName,
      clusterManagerName,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Patch properties of the provided cluster manager, or update the tags assigned to the cluster
   * manager. Properties and tag updates can be done independently.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterManagerName The name of the cluster manager.
   * @param options The options parameters.
   */
  update(
    resourceGroupName: string,
    clusterManagerName: string,
    options?: ClusterManagersUpdateOptionalParams,
  ): Promise<ClusterManagersUpdateResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterManagerName, options },
      updateOperationSpec,
    );
  }

  /**
   * ListBySubscriptionNext
   * @param nextLink The nextLink from the previous successful call to the ListBySubscription method.
   * @param options The options parameters.
   */
  private _listBySubscriptionNext(
    nextLink: string,
    options?: ClusterManagersListBySubscriptionNextOptionalParams,
  ): Promise<ClusterManagersListBySubscriptionNextResponse> {
    return this.client.sendOperationRequest(
      { nextLink, options },
      listBySubscriptionNextOperationSpec,
    );
  }

  /**
   * ListByResourceGroupNext
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param nextLink The nextLink from the previous successful call to the ListByResourceGroup method.
   * @param options The options parameters.
   */
  private _listByResourceGroupNext(
    resourceGroupName: string,
    nextLink: string,
    options?: ClusterManagersListByResourceGroupNextOptionalParams,
  ): Promise<ClusterManagersListByResourceGroupNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, nextLink, options },
      listByResourceGroupNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const listBySubscriptionOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers/Microsoft.NetworkCloud/clusterManagers",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManagerList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.subscriptionId],
  headerParameters: [Parameters.accept],
  serializer,
};
const listByResourceGroupOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkCloud/clusterManagers",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManagerList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkCloud/clusterManagers/{clusterManagerName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManager,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.clusterManagerName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkCloud/clusterManagers/{clusterManagerName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManager,
    },
    201: {
      bodyMapper: Mappers.ClusterManager,
    },
    202: {
      bodyMapper: Mappers.ClusterManager,
    },
    204: {
      bodyMapper: Mappers.ClusterManager,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.clusterManagerParameters,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.clusterManagerName,
  ],
  headerParameters: [
    Parameters.accept,
    Parameters.contentType,
    Parameters.ifMatch,
    Parameters.ifNoneMatch,
  ],
  mediaType: "json",
  serializer,
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkCloud/clusterManagers/{clusterManagerName}",
  httpMethod: "DELETE",
  responses: {
    200: {
      bodyMapper: Mappers.OperationStatusResult,
    },
    201: {
      bodyMapper: Mappers.OperationStatusResult,
    },
    202: {
      bodyMapper: Mappers.OperationStatusResult,
    },
    204: {
      bodyMapper: Mappers.OperationStatusResult,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.clusterManagerName,
  ],
  headerParameters: [
    Parameters.accept,
    Parameters.ifMatch,
    Parameters.ifNoneMatch,
  ],
  serializer,
};
const updateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkCloud/clusterManagers/{clusterManagerName}",
  httpMethod: "PATCH",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManager,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.clusterManagerUpdateParameters,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.clusterManagerName,
  ],
  headerParameters: [
    Parameters.accept,
    Parameters.contentType,
    Parameters.ifMatch,
    Parameters.ifNoneMatch,
  ],
  mediaType: "json",
  serializer,
};
const listBySubscriptionNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManagerList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.nextLink,
    Parameters.subscriptionId,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listByResourceGroupNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManagerList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.nextLink,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
