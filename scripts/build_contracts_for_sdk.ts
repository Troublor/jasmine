import * as fs from "fs";
import * as child_process from "child_process";
import * as path from "path";

// compile contracts
let result = child_process.spawnSync("yarn", ["workspace", "jasmine-contracts", "build"], {
    cwd: path.join(__dirname, ".."),
});
console.log(result.stdout.toString())
if (result.status !== 0) {
    console.error(result.stderr.toString());
    process.exit(result.status);
}

// save abi to a temp file
let abi = path.join(__dirname, "tmp", "contract.abi");
let bin = path.join(__dirname, "tmp", "contract.bin");
let contractBuild = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "packages", "jasmine-contracts", "build", "contracts", "TFCToken.json")
).toString('utf8'));
fs.writeFileSync(abi, JSON.stringify(contractBuild['abi']));
fs.writeFileSync(bin, contractBuild['bytecode']);

console.log("Building golang contract dependency for TFCToken");

// build go dependency with abigen
let goPackage = "token"
let output = path.join(__dirname, "..", "packages", "jasmine-eth-go", "token", "TFCToken.go")
let typeName = "TFCToken"
result = child_process.spawnSync(
    "abigen",
    [`--bin=${bin}`, `--abi=${abi}`, `--pkg=${goPackage}`, `--type=${typeName}`, `--out=${output}`],
    {
        cwd: __dirname,
    }
);
console.log(result.stdout.toString())
if (result.status !== 0) {
    console.error(result.stderr.toString());
    process.exit(result.status);
}

console.log("Dependency generated at", output);

console.log("Building typescript contract dependency for TFCToken");

// build typescript dependency with typechain
let outputDir = path.join(__dirname, "..", "packages", "jasmine-eth-ts", "src", "contracts")
let abis = path.join(__dirname, "..", "packages", "jasmine-contracts", "build", "contracts", "*.json");
result = child_process.spawnSync(
    "typechain",
    ["--target", "web3-v1", "--outDir", outputDir, abis],
    {
        cwd: __dirname,
    }
);
console.log(result.stdout.toString())
if (result.status !== 0) {
    console.error(result.stderr.toString());
    process.exit(result.status);
}

fs.writeFileSync(
    path.join(__dirname, "..", "packages", "jasmine-eth-ts", "src", "contracts", "TFCToken.abi.json"),
    JSON.stringify(contractBuild['abi'], null, 2),
);
fs.writeFileSync(
    path.join(__dirname, "..", "packages", "jasmine-eth-ts", "src", "contracts", "TFCToken.bin"),
    contractBuild['bytecode'],
);

console.log("Dependency generated at", outputDir);
