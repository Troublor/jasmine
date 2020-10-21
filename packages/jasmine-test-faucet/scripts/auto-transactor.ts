/**
 * Auto transactor automatically sends transactions to jasmine-eth contracts to faucet test data.
 *
 * Claim 1 TFC token every 30 minutes.
 * Transfer 0.3 TFC token every 10 minutes.
 * Approve/TransferFrom 0.3 TFC token every 10 minutes.
 */
import * as BN from "bn.js";
import SDK from "jasmine-eth-ts";

class AutoTransactor {
    private static readonly ethEndpoint = "https://rinkeby.infura.io/v3/e8e5b9ad18ad4daeb0e01a522a989d66";
    private static readonly adminPrivateKey = "0x11cb04ef3d5b276da031e0410d9425726187739cbe54cdedd5401911e7428df3";
    private static readonly tfcAddress = "0x44e3BAF945f70fA8a926A84563492662BC9a5c11";
    private static readonly managerAddress = "0xb402822CC243E8f86E28c2F79c67DAcD14A9cc01";
    // transactor1 address 0xD265C6c7487154803CdA1863A2ddeEcd76Ca2382
    private static readonly transactor1PrivateKey = "0x96ca1b47bd2f7b6c1a3018e6038be291c9f5ff9556e5200f677c295693a31c60";
    // transactor2 address 0x8753129763F95948C491B92f61a6a0993E74c25c
    private static readonly transactor2PrivateKey = "0x1a2ea9dbd802477439749f673e890ed6e7bc95b58f2702bfb1d6c5ffdc150035";

    private readonly sdk = new SDK(AutoTransactor.ethEndpoint);
    private readonly admin = this.sdk.retrieveAccount(AutoTransactor.adminPrivateKey);
    private readonly transactor1 = this.sdk.retrieveAccount(AutoTransactor.transactor1PrivateKey);
    private readonly transactor2 = this.sdk.retrieveAccount(AutoTransactor.transactor2PrivateKey);
    private readonly tfc = this.sdk.getTFC(AutoTransactor.tfcAddress);
    private readonly manager = this.sdk.getManager(AutoTransactor.managerAddress);

    public async start() {
        console.log("Test data faucet start");
        console.log(this.transactor1.address, "claims 1 TFC every 30 minutes");
        console.log(this.transactor1.address, "transfers 0.3 TFC to", this.transactor2.address, "every 10 minutes");
        console.log(this.transactor1.address, "delegate transfers 0.3 TFC from", this.transactor2.address, "every 10 minutes");

        let claimTFCIntervalHandle;
        let transferTFCIntervalHandle;
        let transferFromTFCIntervalHandle;

        try {
            await this.claimTFC();
        } catch (e) {
            console.log(new Date().toLocaleString(), "Claim TFC error:", e);
        }
        claimTFCIntervalHandle = setInterval(async () => {
            try {
                await this.claimTFC();
            } catch (e) {
                console.log(new Date().toLocaleString(), "Claim TFC error:", e);
            }
        }, 30 * 60 * 1000);

        setTimeout(async () => {
            try {
                await this.transfer();
            } catch (e) {
                console.log(new Date().toLocaleString(), "Transfer TFC error:", e);
            }
            transferTFCIntervalHandle = setInterval(async () => {
                try {
                    await this.transfer();
                } catch (e) {
                    console.log(new Date().toLocaleString(), "Transfer TFC error:", e);
                }
            }, 10 * 60 * 1000);
        }, 5 * 60 * 1000);

        transferFromTFCIntervalHandle = setInterval(async () => {
            try {
                await this.transferFrom();
            } catch (e) {
                console.log(new Date().toLocaleString(), "TransferFrom TFC error:", e);
            }
        }, 10 * 60 * 1000);

        const stopHandler = () => {
            clearInterval(claimTFCIntervalHandle);
            clearInterval(transferTFCIntervalHandle);
            clearInterval(transferFromTFCIntervalHandle);
            console.log(new Date().toLocaleString(), "AutoTransactor stopped");
        };
        process.on('SIGINT', stopHandler);
        process.on('SIGTERM', stopHandler);
    }

    private async claimTFC() {
        // find a nonce from the largest one
        let nonce = new BN(2).pow(new BN(256)).sub(new BN(1));
        for (; await this.manager.nonceUsed(nonce); nonce = nonce.sub(new BN(1))) {
        }
        const amount = new BN(10).pow(new BN(18));
        // sign claim message
        const signature = this.manager.signTFCClaim(this.transactor1.address, amount, nonce, this.admin);
        await this.manager.claimTFC(amount, nonce, signature, this.transactor1);
        console.log(new Date().toLocaleString(), this.transactor1.address, "claimed 1 TFC");
    }

    /**
     * Transfer 0.3 TFC token from transactor1 to transactor2
     */
    private async transfer() {
        const amount = new BN(10).pow(new BN(17)).mul(new BN(3));
        await this.tfc.transfer(this.transactor2.address, amount, this.transactor1);
        console.log(new Date().toLocaleString(), this.transactor1.address, "transferred 0.3 TFC to", this.transactor2.address);
    }

    /**
     * Delegated transfer 0.3 TFC token from transactor 2 to transactor 1
     */
    private async transferFrom() {
        const amount = new BN(10).pow(new BN(17)).mul(new BN(3));
        // approve
        await this.tfc.approve(this.transactor1.address, amount, this.transactor2);
        console.log(new Date().toLocaleString(), this.transactor2.address, "approved 0.3 TFC to", this.transactor1.address);
        // transfer from
        await this.tfc.transferFrom(this.transactor2.address, this.transactor1.address, amount, this.transactor1);
        console.log(new Date().toLocaleString(), this.transactor1.address, "delegate transferred 0.3 TFC from", this.transactor2.address);
    }

}

(async () => {
    const transactor = new AutoTransactor();
    await transactor.start();
})()
