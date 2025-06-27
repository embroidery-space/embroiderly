import { execSync } from "child_process";
import { renameSync } from "fs";

const BINARY_NAME = "embroiderly-publish";
const EXTENSION = process.platform === "win32" ? ".exe" : "";

console.log("Getting platform target triple.");
const rustInfo = execSync("rustc -vV");

const result = /host: (\S+)/g.exec(rustInfo);
if (!result) {
  console.error("Failed to determine platform target triple");
  process.exit(1);
}

const targetTriple = result[1];
console.log(`Target triple: ${targetTriple}`);

execSync(`cargo build -r -p ${BINARY_NAME}`, { stdio: "inherit" });

console.log(`Storing ${BINARY_NAME} binary with the ${targetTriple} triple.`);
renameSync(
  `target/release/${BINARY_NAME}${EXTENSION}`,
  `crates/embroiderly/binaries/${BINARY_NAME}-${targetTriple}${EXTENSION}`,
);
