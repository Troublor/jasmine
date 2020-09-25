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
            endpoint: mockEth.endpoint,
            tfcAddress: tfcAddress,
        },
    }
}
