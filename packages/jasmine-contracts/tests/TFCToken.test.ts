import {accounts, contract} from '@openzeppelin/test-environment';
import {TfcTokenContract, TfcTokenInstance} from "../contracts/types";
import {expectRevert} from "@openzeppelin/test-helpers";
import {expect} from "chai";
import * as BN from "bn.js";

describe('TFCToken', () => {
    const [admin, user1, user2] = accounts;
    const TFCTokenContract: TfcTokenContract = contract.fromArtifact("TFCToken");
    let TFC: TfcTokenInstance;

    beforeEach(async () => {
        // mint 100 million tokens for each holder (20 in total)
        TFC = await TFCTokenContract.new({from: admin});
        for (let account of accounts.slice(0, 20)) {
            await TFC.mint(account, 100000000, {from: admin});
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


    it('should prevent admin from mint', async function () {
        await expectRevert(TFC.mint(user1, 1000), "ERC20PresetMinterPauser: must have minter role to mint");
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

    it('should construct failed if initialHolders and initialSupplies have different length', function (done) {
        TFCTokenContract.new(accounts.slice(0, 9), Array(20).fill(100000000), {from: admin})
            .catch(() => {
                done();
            });
    });

    it('should construct failed if initialHolders contains zero addresses', function (done) {
        TFCTokenContract.new(Array(20).fill("0x0000000000000000000000000000000000000000"), Array(20).fill(100000000), {from: admin})
            .catch(() => {
                done();
            });
    });

    it('should construct successfully if initialHolders contains same addresses', async function () {
        let tfc = await TFCTokenContract.new(Array(20).fill(admin), Array(20).fill(100000000), {from: admin});
        let totalSupply = await tfc.totalSupply();
        expect(totalSupply.toNumber()).to.be.equal(20 * 100000000);
        let balance = await tfc.balanceOf(admin);
        expect(balance.toNumber()).to.be.equal(20 * 100000000);
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
})
