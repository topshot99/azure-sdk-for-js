/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import type * as coreClient from "@azure/core-client";

/** Check access request details */
export interface CheckPrincipalAccessRequest {
  /** Subject details */
  subject: SubjectInfo;
  /** List of actions. */
  actions: RequiredAction[];
  /** Scope at which the check access is done. */
  scope: string;
}

/** Subject details */
export interface SubjectInfo {
  /** Principal Id */
  principalId: string;
  /** List of group Ids that the principalId is part of. */
  groupIds?: string[];
}

/** Action Info */
export interface RequiredAction {
  /** Action Id. */
  id: string;
  /** Is a data action or not. */
  isDataAction: boolean;
}

/** Check access response details */
export interface CheckPrincipalAccessResponse {
  /** To check if the current user, group, or service principal has permission to read artifacts in the specified workspace. */
  accessDecisions?: CheckAccessDecision[];
}

/** Check access response details */
export interface CheckAccessDecision {
  /** Access Decision. */
  accessDecision?: string;
  /** Action Id. */
  actionId?: string;
  /** Role Assignment response details */
  roleAssignment?: RoleAssignmentDetails;
}

/** Role Assignment response details */
export interface RoleAssignmentDetails {
  /** Role Assignment ID */
  id?: string;
  /** Role ID of the Synapse Built-In Role */
  roleDefinitionId?: string;
  /** Object ID of the AAD principal or security-group */
  principalId?: string;
  /** Scope at the role assignment is created */
  scope?: string;
  /** Type of the principal Id: User, Group or ServicePrincipal */
  principalType?: string;
}

/** Contains details when the response code indicates an error. */
export interface ErrorContract {
  /** The error details. */
  error?: ErrorResponse;
}

/** Common error response for all Azure Resource Manager APIs to return error details for failed operations. (This also follows the OData error response format.) */
export interface ErrorResponse {
  /**
   * The error code.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly code?: string;
  /**
   * The error message.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly message?: string;
  /**
   * The error target.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly target?: string;
  /**
   * The error details.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly details?: ErrorResponse[];
  /**
   * The error additional info.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly additionalInfo?: ErrorAdditionalInfo[];
}

/** The resource management error additional info. */
export interface ErrorAdditionalInfo {
  /**
   * The additional info type.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly type?: string;
  /**
   * The additional info.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly info?: Record<string, unknown>;
}

/** Role Assignment response details */
export interface RoleAssignmentDetailsList {
  /** Number of role assignments */
  count?: number;
  /** A list of role assignments */
  value?: RoleAssignmentDetails[];
}

/** Role Assignment request details */
export interface RoleAssignmentRequest {
  /** Role ID of the Synapse Built-In Role */
  roleId: string;
  /** Object ID of the AAD principal or security-group */
  principalId: string;
  /** Scope at which the role assignment is created */
  scope: string;
  /** Type of the principal Id: User, Group or ServicePrincipal */
  principalType?: string;
}

/** Synapse role definition details */
export interface SynapseRoleDefinition {
  /** Role Definition ID */
  id?: string;
  /** Name of the Synapse role */
  name?: string;
  /** Is a built-in role or not */
  isBuiltIn?: boolean;
  /** Description for the Synapse role */
  description?: string;
  /** Permissions for the Synapse role */
  permissions?: SynapseRbacPermission[];
  /** Allowed scopes for the Synapse role */
  scopes?: string[];
  /** Availability of the Synapse role */
  availabilityStatus?: string;
}

/** Synapse role definition details */
export interface SynapseRbacPermission {
  /** List of actions */
  actions?: string[];
  /** List of Not actions */
  notActions?: string[];
  /** List of data actions */
  dataActions?: string[];
  /** List of Not data actions */
  notDataActions?: string[];
}

/** Defines headers for RoleAssignments_listRoleAssignments operation. */
export interface RoleAssignmentsListRoleAssignmentsHeaders {
  /** If the number of role assignments to be listed exceeds the maxResults limit, a continuation token is returned in this response header.  When a continuation token is returned in the response, it must be specified in a subsequent invocation of the list operation to continue listing the role assignments. */
  xMsContinuation?: string;
}

/** Optional parameters. */
export interface RoleAssignmentsCheckPrincipalAccessOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the checkPrincipalAccess operation. */
export type RoleAssignmentsCheckPrincipalAccessResponse = CheckPrincipalAccessResponse;

/** Optional parameters. */
export interface RoleAssignmentsListRoleAssignmentsOptionalParams
  extends coreClient.OperationOptions {
  /** Synapse Built-In Role Id. */
  roleId?: string;
  /** Object ID of the AAD principal or security-group. */
  principalId?: string;
  /** Scope of the Synapse Built-in Role. */
  scope?: string;
  /** Continuation token. */
  continuationToken?: string;
}

/** Contains response data for the listRoleAssignments operation. */
export type RoleAssignmentsListRoleAssignmentsResponse = RoleAssignmentsListRoleAssignmentsHeaders &
  RoleAssignmentDetailsList;

/** Optional parameters. */
export interface RoleAssignmentsCreateRoleAssignmentOptionalParams
  extends coreClient.OperationOptions {
  /** Type of the principal Id: User, Group or ServicePrincipal */
  principalType?: string;
}

/** Contains response data for the createRoleAssignment operation. */
export type RoleAssignmentsCreateRoleAssignmentResponse = RoleAssignmentDetails;

/** Optional parameters. */
export interface RoleAssignmentsGetRoleAssignmentByIdOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the getRoleAssignmentById operation. */
export type RoleAssignmentsGetRoleAssignmentByIdResponse = RoleAssignmentDetails;

/** Optional parameters. */
export interface RoleAssignmentsDeleteRoleAssignmentByIdOptionalParams
  extends coreClient.OperationOptions {
  /** Scope of the Synapse Built-in Role. */
  scope?: string;
}

/** Optional parameters. */
export interface RoleDefinitionsListRoleDefinitionsOptionalParams
  extends coreClient.OperationOptions {
  /** Scope of the Synapse Built-in Role. */
  scope?: string;
  /** Is a Synapse Built-In Role or not. */
  isBuiltIn?: boolean;
}

/** Contains response data for the listRoleDefinitions operation. */
export type RoleDefinitionsListRoleDefinitionsResponse = SynapseRoleDefinition[];

/** Optional parameters. */
export interface RoleDefinitionsGetRoleDefinitionByIdOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the getRoleDefinitionById operation. */
export type RoleDefinitionsGetRoleDefinitionByIdResponse = SynapseRoleDefinition;

/** Optional parameters. */
export interface RoleDefinitionsListScopesOptionalParams extends coreClient.OperationOptions {}

/** Contains response data for the listScopes operation. */
export type RoleDefinitionsListScopesResponse = {
  /** The parsed response body. */
  body: string[];
};

/** Optional parameters. */
export interface AccessControlClientOptionalParams extends coreClient.ServiceClientOptions {
  /** Api Version */
  apiVersion?: string;
  /** Overrides client endpoint. */
  endpoint?: string;
}
