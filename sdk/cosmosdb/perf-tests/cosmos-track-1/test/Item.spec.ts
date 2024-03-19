import { PerfOptionDictionary, getEnvVar } from "@azure/test-utils-perf";
import { CosmosTest } from "./cosmos.spec";

export class ItemTest extends CosmosTest {
  // The next section talks about the custom options that you can provide for a test
  public options: PerfOptionDictionary = {};
  container: any;

  constructor() {
    super();
    
  }

  public async globalSetup() {
    await super.globalSetup(); // Calling base class' setup
    // Add any additional setup
    // Add one item to the container
    // const item = {
    //   id: "item1",
    //   key: "value"
    // };
    const perftestdb = getEnvVar("COSMOS_DATABASE");
    const perftestcontainer = getEnvVar("COSMOS_CONTAINER");
    await this.cosmosClient.databases.createIfNotExists({ id: perftestdb });
    const container = await this.cosmosClient.database(perftestdb).containers.createIfNotExists({ id: perftestcontainer });

    this.container = container.container; 
    // await this.container.items.create(item);

  }

  async run(): Promise<void> {
    // call the method on `serviceNameClient` that you're interested in testing
    await this.container.items.query("SELECT * from c").fetchAll();
  }

  public async globalCleanup() {
    // await super.globalCleanup(); // Calling base class' cleanup
    // Add any additional cleanup
  }
}
