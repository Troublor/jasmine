import {accounts, privateKeys, contract, web3,} from '@openzeppelin/test-environment';
import {expectRevert} from "@openzeppelin/test-helpers";
import {expect} from "chai";
import * as BN from "bn.js";
import {TfcManagerContract, TfcManagerInstance, TfcTokenContract, TfcTokenInstance} from '../contracts/types';

describe('TFCManager', () => {
    const [admin, user1, user2] = accounts;
    const managerContract: TfcManagerContract = contract.fromArtifact("TFCManager");
    const TFCContract: TfcTokenContract = contract.fromArtifact("TFCToken");
    let manager: TfcManagerInstance;
    let TFC: TfcTokenInstance;

    beforeEach(async () => {
        manager = await managerContract.new({from: admin});
        // @ts-ignore
        TFC = await TFCContract.at(await manager.tfcToken());
    });

    it('should TFC token deployed', function () {
        expect(TFC).to.be.not.undefined;
        // @ts-ignore
        expect(typeof TFC.address).to.be.equal("string");
    });

    it('should signer be creator', async function () {
        let signer = await manager.signer();
        expect(signer).to.be.equal(admin);
    });

    it('should fail when claimTFC gets a sig with wrong length', async function () {
        const amount = 100;
        const nonce = 0;
        const sig = "0x111111111111111111111111111111111111111111111111111111111111111112";

        await expectRevert(
            manager.claimTFC(amount, nonce, sig),
            "signature length incorrect",
        );
    });

    it('should fail if claimTFC gets invalid signature', async function () {
        const amount = 100;
        const nonce = 0;
        const sig = "0x1111111111111111111111111111111111111111111111111111111111111111T";

        await expectRevert(
            manager.claimTFC(amount, nonce, sig),
            "invalid bytes value",
        );
    });

    it('should successfully claimTFC if authorized', async function () {
        const [adminPrivateKey] = privateKeys;
        const amount = 100;
        const nonce = 0;
        // @ts-ignore
        const hash = web3.utils.soliditySha3(user1, amount, nonce, manager.address);
        const sig = web3.eth.accounts.sign(hash, adminPrivateKey).signature;

        let balance = await TFC.balanceOf(user1);
        expect(balance.toNumber()).to.be.equal(0);

        await manager.claimTFC(amount, nonce, sig, {from: user1});

        balance = await TFC.balanceOf(user1);
        expect(balance.toNumber()).to.be.equal(amount);
    });

    it('should not claimTFC if not authorized', async function () {
        const [, user1PrivateKey] = privateKeys;
        const amount = 100;
        const nonce = 0;
        // @ts-ignore
        const hash = web3.utils.soliditySha3(user1, amount, nonce, manager.address);
        const sig = web3.eth.accounts.sign(hash, user1PrivateKey).signature;

        await expectRevert(
            manager.claimTFC(amount, nonce, sig, {from: user1}),
            "unauthorized claim"
        );

        let balance = await TFC.balanceOf(user1);
        expect(balance.toNumber()).to.be.equal(0);
    });

    it('should block replay attack on claimTFC with another contract address', async function () {
        const [adminPrivateKey] = privateKeys;
        const amount = 100;
        const nonce = 0;
        // @ts-ignore
        const hash = web3.utils.soliditySha3(user1, amount, nonce, TFC.address);
        const sig = web3.eth.accounts.sign(hash, adminPrivateKey).signature;

        await expectRevert(
            manager.claimTFC(amount, nonce, sig, {from: user1}),
            "unauthorized claim"
        );

        let balance = await TFC.balanceOf(user1);
        expect(balance.toNumber()).to.be.equal(0);
    });

    it('should block replay attack on claimTFC with used nonce', async function () {
        const [adminPrivateKey] = privateKeys;
        const amount = 100;
        const nonce = 0;
        // @ts-ignore
        const hash = web3.utils.soliditySha3(user1, amount, nonce, manager.address);
        const sig = web3.eth.accounts.sign(hash, adminPrivateKey).signature;

        await manager.claimTFC(amount, nonce, sig, {from: user1});

        // perform replay attack
        await expectRevert(
            manager.claimTFC(amount, nonce, sig, {from: user1}),
            "nonce has already been used"
        )

        let balance = await TFC.balanceOf(user1);
        expect(balance.toNumber()).to.be.equal(amount);
    });
});
