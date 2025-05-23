/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */
import type { DscNodeConfigurationListByAutomationAccountOptionalParams } from "@azure/arm-automation";
import { AutomationClient } from "@azure/arm-automation";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Retrieve a list of dsc node configurations.
 *
 * @summary Retrieve a list of dsc node configurations.
 * x-ms-original-file: specification/automation/resource-manager/Microsoft.Automation/preview/2020-01-13-preview/examples/listDscNodeConfigurations.json
 */
async function listDscNodeConfigurationsByAutomationAccount(): Promise<void> {
  const subscriptionId = process.env["AUTOMATION_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["AUTOMATION_RESOURCE_GROUP"] || "rg";
  const automationAccountName = "myAutomationAccount33";
  const credential = new DefaultAzureCredential();
  const client = new AutomationClient(credential, subscriptionId);
  const resArray = new Array();
  for await (const item of client.dscNodeConfigurationOperations.listByAutomationAccount(
    resourceGroupName,
    automationAccountName,
  )) {
    resArray.push(item);
  }
  console.log(resArray);
}

/**
 * This sample demonstrates how to Retrieve a list of dsc node configurations.
 *
 * @summary Retrieve a list of dsc node configurations.
 * x-ms-original-file: specification/automation/resource-manager/Microsoft.Automation/preview/2020-01-13-preview/examples/listPagedDscNodeConfigurationsWithNameFilter.json
 */
async function listPagedDscNodeConfigurationsByAutomationAccountWithNameFilter(): Promise<void> {
  const subscriptionId = process.env["AUTOMATION_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["AUTOMATION_RESOURCE_GROUP"] || "rg";
  const automationAccountName = "myAutomationAccount33";
  const filter = "contains('.localhost',name)";
  const skip = 0;
  const top = 2;
  const inlinecount = "allpages";
  const options: DscNodeConfigurationListByAutomationAccountOptionalParams = {
    filter,
    skip,
    top,
    inlinecount,
  };
  const credential = new DefaultAzureCredential();
  const client = new AutomationClient(credential, subscriptionId);
  const resArray = new Array();
  for await (const item of client.dscNodeConfigurationOperations.listByAutomationAccount(
    resourceGroupName,
    automationAccountName,
    options,
  )) {
    resArray.push(item);
  }
  console.log(resArray);
}

/**
 * This sample demonstrates how to Retrieve a list of dsc node configurations.
 *
 * @summary Retrieve a list of dsc node configurations.
 * x-ms-original-file: specification/automation/resource-manager/Microsoft.Automation/preview/2020-01-13-preview/examples/listPagedDscNodeConfigurationsWithNoFilter.json
 */
async function listPagedDscNodeConfigurationsByAutomationAccountWithNoFilter(): Promise<void> {
  const subscriptionId = process.env["AUTOMATION_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["AUTOMATION_RESOURCE_GROUP"] || "rg";
  const automationAccountName = "myAutomationAccount33";
  const skip = 0;
  const top = 4;
  const inlinecount = "allpages";
  const options: DscNodeConfigurationListByAutomationAccountOptionalParams = {
    skip,
    top,
    inlinecount,
  };
  const credential = new DefaultAzureCredential();
  const client = new AutomationClient(credential, subscriptionId);
  const resArray = new Array();
  for await (const item of client.dscNodeConfigurationOperations.listByAutomationAccount(
    resourceGroupName,
    automationAccountName,
    options,
  )) {
    resArray.push(item);
  }
  console.log(resArray);
}

async function main(): Promise<void> {
  await listDscNodeConfigurationsByAutomationAccount();
  await listPagedDscNodeConfigurationsByAutomationAccountWithNameFilter();
  await listPagedDscNodeConfigurationsByAutomationAccountWithNoFilter();
}

main().catch(console.error);
