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
let tmp = path.join(__dirname, "tmp", "contract.json");
let contractBuild = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "packages", "jasmine-contracts", "build", "contracts", "TFCToken.json")
).toString('utf8'));
fs.writeFileSync(tmp, JSON.stringify(contractBuild['abi']));

console.log("Building golang contract dependency for TFCToken")

// build go dependency with abigen
let goPackage = "token"
let output = path.join(__dirname, "..", "packages", "jasmine-eth-go", "token", "TFCToken.go")
let typeName = "TFCToken"
result = child_process.spawnSync("abigen", [`--abi=${tmp}`, `--pkg=${goPackage}`, `--type=${typeName}`, `--out=${output}`], {
    cwd: __dirname,
});
console.log(result.stdout.toString())
if (result.status !== 0) {
    console.error(result.stderr.toString());
    process.exit(result.status);
}

console.log("Dependency generated at", output);
