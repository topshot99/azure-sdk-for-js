/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { tracingClient } from "../tracing.js";
import type { KqlScriptOperations } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import type { ArtifactsClient } from "../artifactsClient.js";
import type { SimplePollerLike, OperationState } from "@azure/core-lro";
import { createHttpPoller } from "@azure/core-lro";
import { createLroSpec } from "../lroImpl.js";
import type {
  KqlScriptResource,
  KqlScriptCreateOrUpdateOptionalParams,
  KqlScriptCreateOrUpdateResponse,
  KqlScriptGetByNameOptionalParams,
  KqlScriptGetByNameResponse,
  KqlScriptDeleteByNameOptionalParams,
  ArtifactRenameRequest,
  KqlScriptRenameOptionalParams,
} from "../models/index.js";
import type { RawHttpHeaders } from "@azure/core-rest-pipeline";

// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/kqlScripts/{kqlScriptName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.KqlScriptResource,
    },
    201: {
      bodyMapper: Mappers.KqlScriptResource,
    },
    202: {
      bodyMapper: Mappers.KqlScriptResource,
    },
    204: {
      bodyMapper: Mappers.KqlScriptResource,
    },
    default: {
      bodyMapper: Mappers.ErrorContract,
    },
  },
  requestBody: Parameters.kqlScript,
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [Parameters.endpoint, Parameters.kqlScriptName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const getByNameOperationSpec: coreClient.OperationSpec = {
  path: "/kqlScripts/{kqlScriptName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.KqlScriptResource,
    },
    default: {
      bodyMapper: Mappers.ErrorContract,
    },
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [Parameters.endpoint, Parameters.kqlScriptName],
  headerParameters: [Parameters.accept],
  serializer,
};
const deleteByNameOperationSpec: coreClient.OperationSpec = {
  path: "/kqlScripts/{kqlScriptName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    201: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorContract,
    },
  },
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [Parameters.endpoint, Parameters.kqlScriptName],
  headerParameters: [Parameters.accept],
  serializer,
};
const renameOperationSpec: coreClient.OperationSpec = {
  path: "/kqlScripts/{kqlScriptName}/rename",
  httpMethod: "POST",
  responses: {
    200: {},
    201: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorContract,
    },
  },
  requestBody: Parameters.renameRequest,
  queryParameters: [Parameters.apiVersion2],
  urlParameters: [Parameters.endpoint, Parameters.kqlScriptName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};

/** Class containing KqlScriptOperations operations. */
export class KqlScriptOperationsImpl implements KqlScriptOperations {
  private readonly client: ArtifactsClient;

  /**
   * Initialize a new instance of the class KqlScriptOperations class.
   * @param client - Reference to the service client
   */
  constructor(client: ArtifactsClient) {
    this.client = client;
  }

  /**
   * Creates or updates a KQL Script
   * @param kqlScriptName - KQL script name
   * @param kqlScript - KQL script
   * @param options - The options parameters.
   */
  async beginCreateOrUpdate(
    kqlScriptName: string,
    kqlScript: KqlScriptResource,
    options?: KqlScriptCreateOrUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<KqlScriptCreateOrUpdateResponse>,
      KqlScriptCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<KqlScriptCreateOrUpdateResponse> => {
      return tracingClient.withSpan(
        "ArtifactsClient.beginCreateOrUpdate",
        options ?? {},
        async () => {
          return this.client.sendOperationRequest(
            args,
            spec,
          ) as Promise<KqlScriptCreateOrUpdateResponse>;
        },
      );
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<{
      flatResponse: KqlScriptResource;
      rawResponse: {
        statusCode: number;
        body: any;
        headers: RawHttpHeaders;
      };
    }> => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined = undefined;
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
      args: { kqlScriptName, kqlScript, options },
      spec: createOrUpdateOperationSpec,
    });
    const poller = await createHttpPoller<
      KqlScriptCreateOrUpdateResponse,
      OperationState<KqlScriptCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
    });
    await poller.poll();
    return poller;
  }

  /**
   * Creates or updates a KQL Script
   * @param kqlScriptName - KQL script name
   * @param kqlScript - KQL script
   * @param options - The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    kqlScriptName: string,
    kqlScript: KqlScriptResource,
    options?: KqlScriptCreateOrUpdateOptionalParams,
  ): Promise<KqlScriptCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(kqlScriptName, kqlScript, options);
    return poller.pollUntilDone();
  }

  /**
   * Get KQL script by name
   * @param kqlScriptName - KQL script name
   * @param options - The options parameters.
   */
  async getByName(
    kqlScriptName: string,
    options?: KqlScriptGetByNameOptionalParams,
  ): Promise<KqlScriptGetByNameResponse> {
    return tracingClient.withSpan(
      "ArtifactsClient.getByName",
      options ?? {},
      async (updatedOptions) => {
        return this.client.sendOperationRequest(
          { kqlScriptName, updatedOptions },
          getByNameOperationSpec,
        ) as Promise<KqlScriptGetByNameResponse>;
      },
    );
  }

  /**
   * Delete KQL script by name
   * @param kqlScriptName - KQL script name
   * @param options - The options parameters.
   */
  async beginDeleteByName(
    kqlScriptName: string,
    options?: KqlScriptDeleteByNameOptionalParams,
  ): Promise<SimplePollerLike<OperationState<void>, void>> {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<void> => {
      return tracingClient.withSpan(
        "ArtifactsClient.beginDeleteByName",
        options ?? {},
        async () => {
          return this.client.sendOperationRequest(args, spec) as Promise<void>;
        },
      );
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<{
      flatResponse: void;
      rawResponse: {
        statusCode: number;
        body: any;
        headers: RawHttpHeaders;
      };
    }> => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined = undefined;
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
      args: { kqlScriptName, options },
      spec: deleteByNameOperationSpec,
    });
    const poller = await createHttpPoller<void, OperationState<void>>(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
    });
    await poller.poll();
    return poller;
  }

  /**
   * Delete KQL script by name
   * @param kqlScriptName - KQL script name
   * @param options - The options parameters.
   */
  async beginDeleteByNameAndWait(
    kqlScriptName: string,
    options?: KqlScriptDeleteByNameOptionalParams,
  ): Promise<void> {
    const poller = await this.beginDeleteByName(kqlScriptName, options);
    return poller.pollUntilDone();
  }

  /**
   * Rename KQL script
   * @param kqlScriptName - KQL script name
   * @param renameRequest - Rename request
   * @param options - The options parameters.
   */
  async beginRename(
    kqlScriptName: string,
    renameRequest: ArtifactRenameRequest,
    options?: KqlScriptRenameOptionalParams,
  ): Promise<SimplePollerLike<OperationState<void>, void>> {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<void> => {
      return tracingClient.withSpan("ArtifactsClient.beginRename", options ?? {}, async () => {
        return this.client.sendOperationRequest(args, spec) as Promise<void>;
      });
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<{
      flatResponse: void;
      rawResponse: {
        statusCode: number;
        body: any;
        headers: RawHttpHeaders;
      };
    }> => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined = undefined;
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
      args: { kqlScriptName, renameRequest, options },
      spec: renameOperationSpec,
    });
    const poller = await createHttpPoller<void, OperationState<void>>(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
    });
    await poller.poll();
    return poller;
  }

  /**
   * Rename KQL script
   * @param kqlScriptName - KQL script name
   * @param renameRequest - Rename request
   * @param options - The options parameters.
   */
  async beginRenameAndWait(
    kqlScriptName: string,
    renameRequest: ArtifactRenameRequest,
    options?: KqlScriptRenameOptionalParams,
  ): Promise<void> {
    const poller = await this.beginRename(kqlScriptName, renameRequest, options);
    return poller.pollUntilDone();
  }
}
