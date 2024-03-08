import { createPerfProgram } from "@azure/test-utils-perf";
import { `ServiceNameAPI1Name`Test } from "./api1-name.spec";
import { `ServiceNameAPI2Name`Test } from "./api2-name.spec";

// Expects the .env file at the same level
import * as dotenv from "dotenv";
dotenv.config();

console.log("=== Starting the perf test ===");

const perfProgram = createPerfProgram(`ServiceNameAPIName`Test, `ServiceNameAPIName2`Test);

perfProgram.run();
