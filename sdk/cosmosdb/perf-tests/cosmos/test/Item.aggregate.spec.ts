import { PerfOptionDictionary, getEnvVar } from "@azure/test-utils-perf";
import { CosmosTest } from "./cosmos.spec";

// ~22.53 op/s
export class ItemAggregateTest extends CosmosTest {
  // The next section talks about the custom options that you can provide for a test
  public options: PerfOptionDictionary = {};
  container: any;
  flag: boolean = true;

  constructor() {
    super();
  }

  public async globalSetup() {
    await super.globalSetup(); // Calling base class' setup
    // Add any additional setup
    // Add one item to the container
    // const item = {
    //   id: "item3",
    //   key: "value"
    // };
    const perftestdb = getEnvVar("COSMOS_DATABASE");
    const perftestcontainer = getEnvVar("COSMOS_CONTAINER");
    await this.cosmosClient.databases.createIfNotExists({ id: perftestdb });
    const container = await this.cosmosClient
      .database(perftestdb)
      .containers.createIfNotExists({ id: perftestcontainer });

    this.container = container.container;

    // // read the item
    // const { resource: readItem } = await this.container.item(item.id).read();
    // // check if the item exists
    // if (readItem === undefined) {
    //   await this.container.items.create(item);
    // }
  }

  async run(): Promise<void> {
    // call the method on `serviceNameClient` that you're interested in testing
    // this.container.items.query("SELECT * from c").fetchAll().then((result: any) => {
    //   drainStream(result.resources);
    // });
    // Assuming this structure for the item

    //      {
    //     "id": "item0",
    //     "_partitionKey": "partition0",
    //     "key": "value",
    //     "_rid": "iQZlAJdV3QcBAAAAAAAAAA==",
    //     "_self": "dbs/iQZlAA==/colls/iQZlAJdV3Qc=/docs/iQZlAJdV3QcBAAAAAAAAAA==/",
    //     "_etag": "\"00003c03-0000-4d00-0000-660678060000\"",
    //     "_attachments": "attachments/",
    //     "_ts": 1711699974
    // }
    await this.container.items.query("select * from c order by c.id").fetchAll();
  }

  public async globalCleanup() {
    // delete the item
    // await this.container.item("item1").delete();
    // delte the container
    // await this.container.delete();
    // await super.globalCleanup(); // Calling base class' cleanup
    // Add any additional cleanup
  }
}
