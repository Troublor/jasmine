import ConsoleGetter from "./console-getter";

(async () => {
    const sdk = await ConsoleGetter.sdk();
    const tfc = await ConsoleGetter.tfc(sdk);
    const admin = await ConsoleGetter.account(sdk, "admin", true);
    const recipient = await ConsoleGetter.address(sdk, "recipient");
    const amount = await ConsoleGetter.BN("Amount of TFC to faucet?");
    try {
        await tfc.mint(recipient, amount, admin);
        console.log("Faucet done");
    } catch (e){
        console.error("Faucet failed:", e);
    }
})()
