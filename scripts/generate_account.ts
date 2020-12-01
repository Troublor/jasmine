import SDK from "jasmine-eth-ts";

const sdk = new SDK("https://rinkeby.infura.io/v3/e8e5b9ad18ad4daeb0e01a522a989d66");
const newAcc = sdk.createAccount();
console.log(`New Account:`);
console.log(`Address: ${newAcc.address}`);
console.log(`Private Key: ${newAcc.privateKey}`);
