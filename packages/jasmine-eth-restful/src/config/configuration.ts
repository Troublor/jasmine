import SDK, {MockEthereum} from "jasmine-eth-ts";

let mockEth = new MockEthereum();
let sdk = new SDK(mockEth.endpoint);
let accounts = mockEth.predefinedPrivateKeys.map(key => sdk.retrieveAccount(key));
let tfcAddress;

export default async () => {
    tfcAddress = tfcAddress ? tfcAddress : await sdk.deployTFC(accounts.slice(0, 20), accounts[0]);
    return {
        port: 8989,
        ethereum: {
            endpoint: "https://rinkeby.infura.io/v3/e8e5b9ad18ad4daeb0e01a522a989d66",
            tfcAddress: "0x44e3BAF945f70fA8a926A84563492662BC9a5c11",
            managerAddress: "0xb402822CC243E8f86E28c2F79c67DAcD14A9cc01",
        },
    }
}
