/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
  Association,
  ServiceNetworkingManagementClient
} from "@azure/arm-servicenetworking";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This sample demonstrates how to Create a Association
 *
 * @summary Create a Association
 * x-ms-original-file: specification/servicenetworking/resource-manager/Microsoft.ServiceNetworking/stable/2023-11-01/examples/AssociationPut.json
 */
async function putAssociation() {
  const subscriptionId =
    process.env["SERVICENETWORKING_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName =
    process.env["SERVICENETWORKING_RESOURCE_GROUP"] || "rg1";
  const trafficControllerName = "tc1";
  const associationName = "as1";
  const resource: Association = {
    location: "NorthCentralUS",
    properties: {
      associationType: "subnets",
      subnet: {
        id:
          "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Network/virtualNetworks/vnet-tc/subnets/tc-subnet"
      }
    }
  };
  const credential = new DefaultAzureCredential();
  const client = new ServiceNetworkingManagementClient(
    credential,
    subscriptionId
  );
  const result = await client.associationsInterface.beginCreateOrUpdateAndWait(
    resourceGroupName,
    trafficControllerName,
    associationName,
    resource
  );
  console.log(result);
}

async function main() {
  putAssociation();
}

main().catch(console.error);
