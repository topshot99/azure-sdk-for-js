/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DeploymentStacksClient } from "@azure/arm-resourcesdeploymentstacks";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This sample demonstrates how to Exports the template used to create the deployment stack.
 *
 * @summary Exports the template used to create the deployment stack.
 * x-ms-original-file: specification/resources/resource-manager/Microsoft.Resources/preview/2022-08-01-preview/examples/DeploymentStackSubscriptionExportTemplate.json
 */
async function deploymentStacksExportTemplate() {
  const subscriptionId =
    process.env["RESOURCESDEPLOYMENTSTACKS_SUBSCRIPTION_ID"] ||
    "subscriptions/00000000-0000-0000-0000-000000000000";
  const deploymentStackName = "simpleDeploymentStack";
  const credential = new DefaultAzureCredential();
  const client = new DeploymentStacksClient(credential, subscriptionId);
  const result = await client.deploymentStacks.exportTemplateAtSubscription(
    deploymentStackName
  );
  console.log(result);
}

async function main() {
  deploymentStacksExportTemplate();
}

main().catch(console.error);
