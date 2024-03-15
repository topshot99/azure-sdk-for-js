import { PerfTest, getEnvVar } from "@azure/test-utils-perf";
import {
  CosmosClient
} from "@azure/cosmos";

export abstract class CosmosTest<TOptions = {}> extends PerfTest<TOptions> {
  cosmosClient: CosmosClient;

  constructor() {
    super();
    const endpoint = getEnvVar("COSMOS_ENDPOINT");
    const key = getEnvVar("COSMOS_KEY");
    this.cosmosClient = new CosmosClient({ endpoint, key });
  }

  public async globalSetup() {
    const perftestdb = getEnvVar("COSMOS_DATABASE");
    const perftestcontainer = getEnvVar("COSMOS_CONTAINER");
    await this.cosmosClient.databases.createIfNotExists({ id: perftestdb });
    await this.cosmosClient.database(perftestdb).containers.createIfNotExists({ id: perftestcontainer });
  }

  public async globalCleanup() {
    const perftestdb = getEnvVar("COSMOS_DATABASE");
    await this.cosmosClient.database(perftestdb).delete();
  }
}
