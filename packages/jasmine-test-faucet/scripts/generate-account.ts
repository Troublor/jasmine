import SDK from "jasmine-eth-ts";

const sdk = new SDK("https://rinkeby.infura.io/v3/e8e5b9ad18ad4daeb0e01a522a989d66");
const account = sdk.createAccount();
console.log("Address:", account.address);
console.log("PrivateKey:", account.privateKey);
