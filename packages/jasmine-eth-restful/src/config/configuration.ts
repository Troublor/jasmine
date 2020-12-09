import SDK, {MockEthereum} from "jasmine-eth-ts";

let mockEth = new MockEthereum();
let sdk = new SDK(mockEth.endpoint);
let accounts = mockEth.predefinedPrivateKeys.map(key => sdk.retrieveAccount(key));
let tfcAddress;

export default async () => {
    return {
        port: 8989,
        ethereum: {
            endpoint: "ws://103.253.11.146:8552/",
            tfcAddress: "0xE48d3271a3DE7E51eaA2f70Dd50B2Aa20D4C638E",
            managerAddress: "0x07a457d878BF363E0Bb5aa0B096092f941e19962",
        },
    }
}
