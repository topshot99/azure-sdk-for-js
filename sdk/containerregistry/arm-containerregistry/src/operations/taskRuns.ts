/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper.js";
import { TaskRuns } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import { ContainerRegistryManagementClient } from "../containerRegistryManagementClient.js";
import {
  SimplePollerLike,
  OperationState,
  createHttpPoller,
} from "@azure/core-lro";
import { createLroSpec } from "../lroImpl.js";
import {
  TaskRun,
  TaskRunsListNextOptionalParams,
  TaskRunsListOptionalParams,
  TaskRunsListResponse,
  TaskRunsGetOptionalParams,
  TaskRunsGetResponse,
  TaskRunsCreateOptionalParams,
  TaskRunsCreateResponse,
  TaskRunsDeleteOptionalParams,
  TaskRunUpdateParameters,
  TaskRunsUpdateOptionalParams,
  TaskRunsUpdateResponse,
  TaskRunsGetDetailsOptionalParams,
  TaskRunsGetDetailsResponse,
  TaskRunsListNextResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Class containing TaskRuns operations. */
export class TaskRunsImpl implements TaskRuns {
  private readonly client: ContainerRegistryManagementClient;

  /**
   * Initialize a new instance of the class TaskRuns class.
   * @param client Reference to the service client
   */
  constructor(client: ContainerRegistryManagementClient) {
    this.client = client;
  }

  /**
   * Lists all the task runs for a specified container registry.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param options The options parameters.
   */
  public list(
    resourceGroupName: string,
    registryName: string,
    options?: TaskRunsListOptionalParams,
  ): PagedAsyncIterableIterator<TaskRun> {
    const iter = this.listPagingAll(resourceGroupName, registryName, options);
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
        return this.listPagingPage(
          resourceGroupName,
          registryName,
          options,
          settings,
        );
      },
    };
  }

  private async *listPagingPage(
    resourceGroupName: string,
    registryName: string,
    options?: TaskRunsListOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<TaskRun[]> {
    let result: TaskRunsListResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._list(resourceGroupName, registryName, options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listNext(
        resourceGroupName,
        registryName,
        continuationToken,
        options,
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listPagingAll(
    resourceGroupName: string,
    registryName: string,
    options?: TaskRunsListOptionalParams,
  ): AsyncIterableIterator<TaskRun> {
    for await (const page of this.listPagingPage(
      resourceGroupName,
      registryName,
      options,
    )) {
      yield* page;
    }
  }

  /**
   * Gets the detailed information for a given task run.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    options?: TaskRunsGetOptionalParams,
  ): Promise<TaskRunsGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, taskRunName, options },
      getOperationSpec,
    );
  }

  /**
   * Creates a task run for a container registry with the specified parameters.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param taskRun The parameters of a run that needs to scheduled.
   * @param options The options parameters.
   */
  async beginCreate(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    taskRun: TaskRun,
    options?: TaskRunsCreateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<TaskRunsCreateResponse>,
      TaskRunsCreateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<TaskRunsCreateResponse> => {
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
      args: { resourceGroupName, registryName, taskRunName, taskRun, options },
      spec: createOperationSpec,
    });
    const poller = await createHttpPoller<
      TaskRunsCreateResponse,
      OperationState<TaskRunsCreateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "azure-async-operation",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Creates a task run for a container registry with the specified parameters.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param taskRun The parameters of a run that needs to scheduled.
   * @param options The options parameters.
   */
  async beginCreateAndWait(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    taskRun: TaskRun,
    options?: TaskRunsCreateOptionalParams,
  ): Promise<TaskRunsCreateResponse> {
    const poller = await this.beginCreate(
      resourceGroupName,
      registryName,
      taskRunName,
      taskRun,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Deletes a specified task run resource.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param options The options parameters.
   */
  delete(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    options?: TaskRunsDeleteOptionalParams,
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, taskRunName, options },
      deleteOperationSpec,
    );
  }

  /**
   * Updates a task run with the specified parameters.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param updateParameters The parameters for updating a task run.
   * @param options The options parameters.
   */
  async beginUpdate(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    updateParameters: TaskRunUpdateParameters,
    options?: TaskRunsUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<TaskRunsUpdateResponse>,
      TaskRunsUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<TaskRunsUpdateResponse> => {
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
        registryName,
        taskRunName,
        updateParameters,
        options,
      },
      spec: updateOperationSpec,
    });
    const poller = await createHttpPoller<
      TaskRunsUpdateResponse,
      OperationState<TaskRunsUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "azure-async-operation",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Updates a task run with the specified parameters.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param updateParameters The parameters for updating a task run.
   * @param options The options parameters.
   */
  async beginUpdateAndWait(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    updateParameters: TaskRunUpdateParameters,
    options?: TaskRunsUpdateOptionalParams,
  ): Promise<TaskRunsUpdateResponse> {
    const poller = await this.beginUpdate(
      resourceGroupName,
      registryName,
      taskRunName,
      updateParameters,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Gets the detailed information for a given task run that includes all secrets.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param taskRunName The name of the task run.
   * @param options The options parameters.
   */
  getDetails(
    resourceGroupName: string,
    registryName: string,
    taskRunName: string,
    options?: TaskRunsGetDetailsOptionalParams,
  ): Promise<TaskRunsGetDetailsResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, taskRunName, options },
      getDetailsOperationSpec,
    );
  }

  /**
   * Lists all the task runs for a specified container registry.
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param options The options parameters.
   */
  private _list(
    resourceGroupName: string,
    registryName: string,
    options?: TaskRunsListOptionalParams,
  ): Promise<TaskRunsListResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, options },
      listOperationSpec,
    );
  }

  /**
   * ListNext
   * @param resourceGroupName The name of the resource group to which the container registry belongs.
   * @param registryName The name of the container registry.
   * @param nextLink The nextLink from the previous successful call to the List method.
   * @param options The options parameters.
   */
  private _listNext(
    resourceGroupName: string,
    registryName: string,
    nextLink: string,
    options?: TaskRunsListNextOptionalParams,
  ): Promise<TaskRunsListNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, nextLink, options },
      listNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns/{taskRunName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRun,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
    Parameters.taskRunName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const createOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns/{taskRunName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRun,
    },
    201: {
      bodyMapper: Mappers.TaskRun,
    },
    202: {
      bodyMapper: Mappers.TaskRun,
    },
    204: {
      bodyMapper: Mappers.TaskRun,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.taskRun,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
    Parameters.taskRunName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns/{taskRunName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
    Parameters.taskRunName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const updateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns/{taskRunName}",
  httpMethod: "PATCH",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRun,
    },
    201: {
      bodyMapper: Mappers.TaskRun,
    },
    202: {
      bodyMapper: Mappers.TaskRun,
    },
    204: {
      bodyMapper: Mappers.TaskRun,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.updateParameters1,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
    Parameters.taskRunName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const getDetailsOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns/{taskRunName}/listDetails",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRun,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
    Parameters.taskRunName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/{registryName}/taskRuns",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRunListResult,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.resourceGroupName1,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.TaskRunListResult,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.registryName,
    Parameters.nextLink,
    Parameters.resourceGroupName1,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
