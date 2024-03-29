import { PerfOptionDictionary, getEnvVar } from "@azure/test-utils-perf";
import { CosmosTest } from "./cosmos.spec";
import { OperationInput } from "@azure/cosmos";
// ~78 op/s
export class ItemBulkTest extends CosmosTest {
  // The next section talks about the custom options that you can provide for a test
  public options: PerfOptionDictionary = {};
  container: any;
  flag: boolean = true;
  ItemCreationFlag: boolean = true;

  constructor() {
    super();
  }

  public async globalSetup() {
    await super.globalSetup(); // Calling base class' setup
    const perftestdb = getEnvVar("COSMOS_DATABASE");
    const perftestcontainer = getEnvVar("COSMOS_CONTAINER");
    await this.cosmosClient.databases.createIfNotExists({ id: perftestdb, throughput: 100000 });

    // Acquire the mutex lock
    // const mutex = new Mutex();
    // const release = await mutex.acquire();

      const container = await this.cosmosClient.database(perftestdb).containers.createIfNotExists({
        id: perftestcontainer,
        partitionKey: { paths: ["/partitionKey"] },
      });

      this.container = container.container;

      // Call the setup function for Items bulk API
      // if (this.ItemCreationFlag) {
      //   await this.setupItemsBulk();
      //   this.ItemCreationFlag = false;
      // }
    
  }

  async setupItemsBulk(): Promise<void> {
    for (let i = 0; i < 300; i++) {
      const item = {
        id: `item${i}`,
        _partitionKey: `partition${i}`,
        key: "value",
      };
      await this.container.items.create(item);
    }
  }

  public async globalCleanup() {
    // delete the item
    // await this.container.item("item1").delete();
    // delete the container
    // await this.container.delete();
    // await super.globalCleanup(); // Calling base class' cleanup
    // Add any additional cleanup
  }

  async run(): Promise<void> {
    // make a bulk read call for items created earlier using bulk api
    try {
      await this.setupItemsBulkRead();
    } catch (err) {
      // console.log(err);
    }
  }

  async setupItemsBulkRead(): Promise<void> {
    const operationInputs = [];

    // Create 300 operation inputs with useful arguments
    for (let i = 0; i < 300; i++) {
      const operationInput: OperationInput = {
        id: `item${i}`,
        partitionKey: `partition${i}`,
        operationType: "Read",
      };

      operationInputs.push(operationInput);
    }

    // Pass the operation inputs to the database
    await this.container.items.bulk(operationInputs);
  }
}
