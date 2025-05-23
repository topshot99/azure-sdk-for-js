/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  Cluster,
  ClustersListBySubscriptionOptionalParams,
  ClustersListByResourceGroupOptionalParams,
  ClusterJob,
  ClustersListStreamingJobsOptionalParams,
  ClustersCreateOrUpdateOptionalParams,
  ClustersCreateOrUpdateResponse,
  ClustersUpdateOptionalParams,
  ClustersUpdateResponse,
  ClustersGetOptionalParams,
  ClustersGetResponse,
  ClustersDeleteOptionalParams,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a Clusters. */
export interface Clusters {
  /**
   * Lists all of the clusters in the given subscription.
   * @param options The options parameters.
   */
  listBySubscription(
    options?: ClustersListBySubscriptionOptionalParams,
  ): PagedAsyncIterableIterator<Cluster>;
  /**
   * Lists all of the clusters in the given resource group.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  listByResourceGroup(
    resourceGroupName: string,
    options?: ClustersListByResourceGroupOptionalParams,
  ): PagedAsyncIterableIterator<Cluster>;
  /**
   * Lists all of the streaming jobs in the given cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param options The options parameters.
   */
  listStreamingJobs(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersListStreamingJobsOptionalParams,
  ): PagedAsyncIterableIterator<ClusterJob>;
  /**
   * Creates a Stream Analytics Cluster or replaces an already existing cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param cluster The definition of the cluster that will be used to create a new cluster or replace
   *                the existing one.
   * @param options The options parameters.
   */
  beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    cluster: Cluster,
    options?: ClustersCreateOrUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<ClustersCreateOrUpdateResponse>,
      ClustersCreateOrUpdateResponse
    >
  >;
  /**
   * Creates a Stream Analytics Cluster or replaces an already existing cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param cluster The definition of the cluster that will be used to create a new cluster or replace
   *                the existing one.
   * @param options The options parameters.
   */
  beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    cluster: Cluster,
    options?: ClustersCreateOrUpdateOptionalParams,
  ): Promise<ClustersCreateOrUpdateResponse>;
  /**
   * Updates an existing cluster. This can be used to partially update (ie. update one or two properties)
   * a cluster without affecting the rest of the cluster definition.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param cluster The properties specified here will overwrite the corresponding properties in the
   *                existing cluster (ie. Those properties will be updated).
   * @param options The options parameters.
   */
  beginUpdate(
    resourceGroupName: string,
    clusterName: string,
    cluster: Cluster,
    options?: ClustersUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<ClustersUpdateResponse>,
      ClustersUpdateResponse
    >
  >;
  /**
   * Updates an existing cluster. This can be used to partially update (ie. update one or two properties)
   * a cluster without affecting the rest of the cluster definition.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param cluster The properties specified here will overwrite the corresponding properties in the
   *                existing cluster (ie. Those properties will be updated).
   * @param options The options parameters.
   */
  beginUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    cluster: Cluster,
    options?: ClustersUpdateOptionalParams,
  ): Promise<ClustersUpdateResponse>;
  /**
   * Gets information about the specified cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersGetOptionalParams,
  ): Promise<ClustersGetResponse>;
  /**
   * Deletes the specified cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersDeleteOptionalParams,
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Deletes the specified cluster.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param clusterName The name of the cluster.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersDeleteOptionalParams,
  ): Promise<void>;
}
