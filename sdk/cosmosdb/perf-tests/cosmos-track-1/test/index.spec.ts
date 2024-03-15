import { createPerfProgram } from "@azure/test-utils-perf";
import { ItemTest } from "./Item.spec";
// import { `ServiceNameAPI2Name`Test } from "./api2-name.spec";

// Expects the .env file at the same level
import * as dotenv from "dotenv";
dotenv.config();

console.log("=== Starting the perf test ===");

// const perfProgram = createPerfProgram(ItemTest, `ServiceNameAPIName2`Test);
const perfProgram = createPerfProgram(ItemTest);

perfProgram.run();
