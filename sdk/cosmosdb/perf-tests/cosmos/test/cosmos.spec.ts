import { PerfTest, getEnvVar } from "@azure/test-utils-perf";
import {
  CosmosClient
} from "@azure/cosmos";

export abstract class CosmosTest<TOptions = {}> extends PerfTest<TOptions> {
  cosmosClient: CosmosClient;

  constructor() {
    super();
    // Setting up the serviceNameClient
  }

  public async globalSetup() {
    // .createResources() using serviceNameClient
  }

  public async globalCleanup() {
    // .deleteResources() using serviceNameClient
  }
}
