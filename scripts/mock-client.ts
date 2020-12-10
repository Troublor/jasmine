// simulate the behaviour of App to claim TFC

import SDK from "jasmine-eth-ts";
import BN from "bn.js";

(async () => {

    const privateKey = "0x5e3652d9bd3beb86a3b65255f4b60026050381234a598d9c426f8aaad079685c";
    const address = "0xb0eE37B789db1D426089B35F7E4054c295ABD6d9";
    const endpoint = "ws://103.253.11.146:8552";
    const managerAddress = "0x07a457d878BF363E0Bb5aa0B096092f941e19962";
    const tfcAddress = "0xE48d3271a3DE7E51eaA2f70Dd50B2Aa20D4C638E";

    const sdk = new SDK(endpoint);

    const admin = sdk.retrieveAccount("0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773");
    const account = sdk.retrieveAccount(privateKey);

    if ((await sdk.balanceOf(account.address)).eq(new BN(0))) {
        console.log("faucet ETH");
        await sdk.transfer(account.address, sdk.ether2wei(new BN(1)), admin);
    }

    const manager = sdk.getManager(managerAddress);
    const tfc = sdk.getTFC(tfcAddress);
    // const nonce = await manager.getUnusedNonce();
    // console.log("nonce=", nonce.toString(10));
    // const amount = new BN("1000000000000000000");
    // console.log("amount=", amount);
    // const sig = manager.signTFCClaim(account.address, amount, nonce, admin);
    // console.log("sig=", sig);
    // await manager.claimTFC(amount, nonce, sig, account);
    console.log(await tfc.balanceOf("0x29f0563f114eFf8f816e0FD7fB1640a410c97163"));
    console.log(await sdk.balanceOf("0x29f0563f114eFf8f816e0FD7fB1640a410c97163"));

    const events = await manager.contract.getPastEvents("allEvents", {fromBlock: 0});
    console.log(events)

    const receipt = await manager.web3.eth.getTransactionReceipt("0x9bb2b192cca8e57d5f5319190c6832dd0f5971a4b4c1e6419c16de45c2c99b27");
    console.log(receipt)

    console.log(await manager.web3.eth.getBlockNumber());

})()
