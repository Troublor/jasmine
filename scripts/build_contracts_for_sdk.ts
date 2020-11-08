import * as fs from "fs";
import * as child_process from "child_process";
import * as path from "path";

console.log("Compiling smart contracts");
// compile contracts
let result = child_process.spawnSync("yarn", ["workspace", "jasmine-contracts", "build"], {
    cwd: path.join(__dirname, ".."),
});
console.log(result.stdout.toString())
if (result.status !== 0) {
    console.error(result.stderr.toString());
    process.exit(result.status);
}

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

let actionForEachContract = (contractName: string) => {
    if (!fs.existsSync(path.join(__dirname, "tmp"))) {
        fs.mkdirSync(path.join(__dirname, "tmp"));
    }
    // save abi to a temp file
    let abi = path.join(__dirname, "tmp", `${contractName}.abi`);
    let bin = path.join(__dirname, "tmp", `${contractName}.bin`);
    let contractBuild = JSON.parse(fs.readFileSync(
        path.join(__dirname, "..", "packages", "jasmine-contracts", "build", "contracts", `${contractName}.json`)
    ).toString('utf8'));
    fs.writeFileSync(abi, JSON.stringify(contractBuild['abi']));
    fs.writeFileSync(bin, contractBuild['bytecode']);

    console.log("Building golang contract dependency for TFCToken");

    let goPackage = "token"
    let output = path.join(__dirname, "..", "packages", "jasmine-eth-go", "token", `${contractName}.go`)
    result = child_process.spawnSync(
        "abige",
        [`--bin=${bin}`, `--abi=${abi}`, `--pkg=${goPackage}`, `--type=${contractName}`, `--out=${output}`],
        {
            cwd: __dirname,
        }
    );
    if (result.error) {
        console.warn("Generate golang contract binding failed, did you have abigen in PATH?")
    }else {
        console.log(result.stdout.toString());
        if (result.status !== 0) {
            console.error(result.stderr.toString());
            process.exit(result.status);
        }
    }

    console.log("Copying bytecode and ABI for TFCToken");

    fs.writeFileSync(
        path.join(__dirname, "..", "packages", "jasmine-eth-ts", "src", "contracts", `${contractName}.abi.json`),
        JSON.stringify(contractBuild['abi'], null, 2),
    );
    fs.writeFileSync(
        path.join(__dirname, "..", "packages", "jasmine-eth-ts", "src", "contracts", `${contractName}.bin`),
        contractBuild['bytecode'],
    );

    fs.writeFileSync(
        path.join(__dirname, "..", "packages", "jasmine-eth-python", "jasmine_eth", "contracts", `${contractName}.abi.json`),
        JSON.stringify(contractBuild['abi'], null, 2),
    );
    fs.writeFileSync(
        path.join(__dirname, "..", "packages", "jasmine-eth-python", "jasmine_eth", "contracts", `${contractName}.bin`),
        contractBuild['bytecode'],
    );
};

actionForEachContract("TFCToken");
actionForEachContract("TFCManager");
