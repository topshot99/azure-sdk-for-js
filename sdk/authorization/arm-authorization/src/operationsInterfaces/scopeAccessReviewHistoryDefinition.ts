/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  AccessReviewHistoryDefinitionProperties,
  ScopeAccessReviewHistoryDefinitionCreateOptionalParams,
  ScopeAccessReviewHistoryDefinitionCreateResponse,
  ScopeAccessReviewHistoryDefinitionDeleteByIdOptionalParams
} from "../models";

/** Interface representing a ScopeAccessReviewHistoryDefinition. */
export interface ScopeAccessReviewHistoryDefinition {
  /**
   * Create a scheduled or one-time Access Review History Definition
   * @param scope The scope of the resource.
   * @param historyDefinitionId The id of the access review history definition.
   * @param properties Access review history definition properties.
   * @param options The options parameters.
   */
  create(
    scope: string,
    historyDefinitionId: string,
    properties: AccessReviewHistoryDefinitionProperties,
    options?: ScopeAccessReviewHistoryDefinitionCreateOptionalParams
  ): Promise<ScopeAccessReviewHistoryDefinitionCreateResponse>;
  /**
   * Delete an access review history definition
   * @param scope The scope of the resource.
   * @param historyDefinitionId The id of the access review history definition.
   * @param options The options parameters.
   */
  deleteById(
    scope: string,
    historyDefinitionId: string,
    options?: ScopeAccessReviewHistoryDefinitionDeleteByIdOptionalParams
  ): Promise<void>;
}