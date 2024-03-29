import { createPerfProgram } from "@azure/test-utils-perf";
import { ItemTest } from "./Item.spec";
// import { `ServiceNameAPI2Name`Test } from "./api2-name.spec";

// Expects the .env file at the same level
import * as dotenv from "dotenv";
import { ItemBulkTest } from "./item.bulk.spec";
import { ItemAggregateTest } from "./Item.aggregate.spec";
dotenv.config();

console.log("=== Starting the perf test ===");

// const perfProgram = createPerfProgram(ItemTest, `ServiceNameAPIName2`Test);
const perfProgram = createPerfProgram(ItemTest, ItemBulkTest, ItemAggregateTest);

perfProgram.run();
