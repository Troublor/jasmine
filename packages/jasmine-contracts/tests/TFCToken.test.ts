import {accounts, contract} from '@openzeppelin/test-environment';
import {TfcTokenContract, TfcTokenInstance} from "../contracts/types";
import {expectRevert} from "@openzeppelin/test-helpers";
import {expect} from "chai";
import * as BN from "bn.js";

describe('TFCToken', function () {
    this.timeout(5000);
    const [admin, user1, user2, minter] = accounts;
    const TFCTokenContract: TfcTokenContract = contract.fromArtifact("TFCToken");
    let TFC: TfcTokenInstance;

    beforeEach(async () => {
        // mint 100000000 tokens for each holder (20 in total)
        TFC = await TFCTokenContract.new(admin, minter, {from: admin});
        for (const acc of accounts.slice(0, 20)) {
            await TFC.mint(acc, 100000000, {from: minter});
        }
    });

    it('should have correct total supply', async function () {
        let total: BN = await TFC.totalSupply();
        expect(total.toNumber()).to.be.equal(20 * 100000000);
    });

    it('should have correct name and symbol', async function () {
        expect(await TFC.name()).to.be.equal("TFCToken");
        expect(await TFC.symbol()).to.be.equal("TFC");
    });


    it('should prevent non-admin from mint', function () {
        expectRevert(TFC.mint(user1, 1000), "ERC20MinterPauserBurner: must have minter role to mint");
    });

    it('should allow minter to mint', async function () {
        await TFC.grantRole(await TFC.MINTER_ROLE(), user2, {from: admin});
        await TFC.mint(user1, 1000, {from: user2});
        let total = await TFC.totalSupply();
        expect(total.toNumber()).to.be.equal(1000 + 20 * 100000000);
    });

    it('should correctly do initial supply', async function () {
        for (let i = 0; i < 20; i++) {
            let account = accounts[i];
            let balance = await TFC.balanceOf(account);
            expect(balance.toNumber()).to.be.equal(100000000);
        }
        for (let account of accounts.slice(20)) {
            let balance = await TFC.balanceOf(account);
            expect(balance.toNumber()).to.be.equal(0);
        }
    });

    it('should be able to one to many transfer', async function () {
        await TFC.one2manyTransfer(accounts.slice(20), Array(10).fill(10000000), {from: admin});
        let balance = await TFC.balanceOf(admin);
        expect(balance.toNumber()).to.be.equal(0);
        for (let account of accounts.slice(20)) {
            balance = await TFC.balanceOf(account);
            expect(balance.toNumber()).to.be.equal(10000000);
        }
        let totalSupply = await TFC.totalSupply();
        expect(totalSupply.toNumber()).to.be.equal(20 * 100000000);
    });

    it('should not be able to one-to-many transfer if the array length is not equal', function (done) {
        TFC.one2manyTransfer(accounts.slice(21), Array(10).fill(10000000), {from: admin})
            .catch(() => {
                done();
            });
    });

    it('should be able to one-to-many transfer if recipients are the same', async function () {
        await TFC.one2manyTransfer(Array(10).fill(accounts[20]), Array(10).fill(10000000), {from: admin});
        let balance = await TFC.balanceOf(admin);
        expect(balance.toNumber()).to.be.equal(0);
        balance = await TFC.balanceOf(accounts[20]);
        expect(balance.toNumber()).to.be.equal(100000000);
        let totalSupply = await TFC.totalSupply();
        expect(totalSupply.toNumber()).to.be.equal(20 * 100000000);
    });

    it('should not be able to one-to-many transfer if sender do not have enough found', function (done) {
        TFC.one2manyTransfer(accounts.slice(20), Array(10).fill(10000001), {from: admin})
            .catch(async () => {
                let balance = await TFC.balanceOf(admin);
                expect(balance.toNumber()).to.be.equal(100000000);
                done();
            });
    });

    it('should not be able to one-to-many transfer if recipients contains zero address', function (done) {
        TFC.one2manyTransfer(Array(10).fill("0x0000000000000000000000000000000000000000"), Array(10).fill(10000000), {from: admin})
            .catch(async () => {
                let balance = await TFC.balanceOf(admin);
                expect(balance.toNumber()).to.be.equal(100000000);
                done();
            });
    });

    it('should prevent non-admin to burn', async function () {
        expectRevert(TFC.burn(100, {from: minter}), "must have burner role");
        await TFC.approve(minter, 100, {from: admin})
        expectRevert(TFC.burnFrom(admin, 100, {from: minter}), "must have burner role");
    });

    it('should admin be able to burn', async function () {
        let originalTotal = await TFC.totalSupply();
        let originalBalance = await TFC.balanceOf(admin);
        await TFC.burn(100, {from: admin});
        let balance = await TFC.balanceOf(admin);
        let total = await TFC.totalSupply();
        expect(balance.toNumber() + 100).to.be.equal(originalBalance.toNumber());
        expect(total.toNumber() + 100).to.be.equal(originalTotal.toNumber());

        originalTotal = await TFC.totalSupply();
        originalBalance = await TFC.balanceOf(user1);
        await TFC.approve(admin, 100, {from: user1})
        await TFC.burnFrom(user1, 100, {from: admin});
        balance = await TFC.balanceOf(user1);
        total = await TFC.totalSupply();
        expect(balance.toNumber() + 100).to.be.equal(originalBalance.toNumber());
        expect(total.toNumber() + 100).to.be.equal(originalTotal.toNumber());
    });

    it('should prevent non-admin to pause', function () {
        expectRevert(TFC.pause({from: minter}), "must have pauser role");
        expectRevert(TFC.unpause({from: minter}), "must have pauser role");
    });

    it('should allow admin to pause', async function () {
        // can transfer before pause
        let originalBalance = await TFC.balanceOf(user1);
        await TFC.transfer(user2, 100, {from: user1});
        let balance = await TFC.balanceOf(user1);
        expect(balance.toNumber() + 100).to.be.equal(originalBalance.toNumber());

        await TFC.pause({from: admin});

        // cannot transfer after pause
        expectRevert(TFC.transfer(user2, 100, {from: user1}), "token transfer while paused");

        // can transfer after unpause
        await TFC.unpause({from: admin});
        originalBalance = await TFC.balanceOf(user1);
        await TFC.transfer(user2, 100, {from: user1});
        balance = await TFC.balanceOf(user1);
        expect(balance.toNumber() + 100).to.be.equal(originalBalance.toNumber());
    });
})
